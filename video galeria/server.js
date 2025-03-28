const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const crypto = require('crypto')

const app = express()
const port = 3000
const videosPath = 'D:/Herbert/VIDEO CRAFT/Assets - DB/Videos/Filmes & youtube'

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Função recursiva para buscar vídeos em todas as subpastas
function getAllVideos(dirPath) {
  let results = []
  const list = fs.readdirSync(dirPath)

  list.forEach(file => {
    const fullPath = path.join(dirPath, file)
    const stat = fs.statSync(fullPath)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllVideos(fullPath)) // chamada recursiva
    } else if (
      fullPath.endsWith('.mp4') ||
      fullPath.endsWith('.mkv') ||
      fullPath.endsWith('.avi')
    ) {
      results.push(fullPath)
    }
  })

  return results
}

app.get('/videos', (req, res) => {
  const folderParam = req.query.folder
  let targetPath = videosPath

  if (folderParam && folderParam !== 'ALL') {
    targetPath = path.join(videosPath, folderParam)
  }

  try {
    const allVideos = getAllVideos(targetPath)
    const shuffledVideos = allVideos.sort(() => 0.5 - Math.random())
    const randomVideos = shuffledVideos.slice(0, 12)
    res.json(randomVideos)
  } catch (err) {
    console.error('Error reading video directory:', err)
    res.status(500).send('Error reading video directory')
  }
})

app.get('/video-duration', (req, res) => {
  const videoPath = req.query.path

  if (!videoPath) {
    console.error('Missing required query parameter: path')
    return res.status(400).send('Missing required query parameter: path')
  }

  const ffmpegCommand = `ffmpeg -i "${videoPath}" 2>&1 | grep "Duration"`

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting video duration:', error)
      return res.status(500).send('Error getting video duration')
    }

    const durationMatch = stdout.match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
    if (!durationMatch) {
      console.error('Could not parse video duration')
      return res.status(500).send('Could not parse video duration')
    }

    const hours = parseInt(durationMatch[1], 10)
    const minutes = parseInt(durationMatch[2], 10)
    const seconds = parseFloat(durationMatch[3])

    const durationInSeconds = hours * 3600 + minutes * 60 + seconds
    res.json({ duration: durationInSeconds })
  })
})

app.get('/stream', (req, res) => {
  const videoPath = req.query.path
  const startPercent = parseFloat(req.query.start)
  const clipDuration = parseFloat(req.query.clipDuration)

  if (!videoPath || isNaN(startPercent) || isNaN(clipDuration)) {
    console.error('Missing required query parameters')
    return res.status(400).send('Missing required query parameters')
  }

  // Get the duration of the video using ffprobe
  const ffprobeCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
  exec(ffprobeCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting video duration:', error)
      return res.status(500).send('Error getting video duration')
    }

    const durationInSeconds = parseFloat(stdout)
    if (isNaN(durationInSeconds)) {
      console.error('Could not parse video duration')
      return res.status(500).send('Could not parse video duration')
    }

    const startTime = startPercent * durationInSeconds
    const endTime = Math.min(startTime + clipDuration, durationInSeconds)

    const tempFilePath = path.join(__dirname, 'temp', `temp_${Date.now()}.mp4`)
    const ffmpegStreamCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -c copy "${tempFilePath}"`

    console.log(`Executing command: ${ffmpegStreamCommand}`)
    exec(ffmpegStreamCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error streaming video:', error)
        console.error('stderr:', stderr)
        return res.status(500).send('Error streaming video')
      }

      console.log(`Streaming video: ${tempFilePath}`)
      res.sendFile(tempFilePath, err => {
        if (err) {
          console.error('Error sending file:', err)
        } else {
          console.log(`Successfully sent: ${tempFilePath}`)
        }
        fs.unlink(tempFilePath, err => {
          if (err) {
            console.error('Error deleting temp file:', err)
          } else {
            console.log(`Deleted temp file: ${tempFilePath}`)
          }
        })
      })
    })
  })
})

app.get('/folders', (req, res) => {
  try {
    const folders = fs.readdirSync(videosPath).filter(folder => {
      const folderPath = path.join(videosPath, folder)
      return fs.statSync(folderPath).isDirectory()
    })
    res.json(['ALL', ...folders])
  } catch (err) {
    console.error('Erro ao listar pastas:', err)
    res.status(500).send('Erro ao listar pastas')
  }
})


app.post('/cut', (req, res) => {
  const videoPath = req.query.path
  const startPercent = parseFloat(req.query.start)
  const clipDuration = parseFloat(req.query.clipDuration)
  const action = req.query.action

  if (!videoPath || isNaN(startPercent) || isNaN(clipDuration)) {
    console.error('Missing required query parameters')
    return res.status(400).send('Missing required query parameters')
  }

  const videoName = path
    .basename(videoPath, path.extname(videoPath))
    .slice(0, 8) // Pega os primeiros 8 caracteres do título
  const outputFolder = path.join(__dirname, 'output')
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }

  const ffprobeCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
  exec(ffprobeCommand, (error, stdout) => {
    if (error) {
      console.error('Error getting video duration:', error)
      return res.status(500).send('Error getting video duration')
    }

    const durationInSeconds = parseFloat(stdout)
    const startTime = Math.floor(startPercent * durationInSeconds) // Converte para segundos inteiros
    const endTime = startTime + Math.floor(clipDuration)

    const uniqueName = `${videoName}_${startTime}-${endTime}`
    const outputFilePath = path.join(outputFolder, `${uniqueName}.mp4`)
    const proxyFolder = path.join(outputFolder, 'proxy')
    if (!fs.existsSync(proxyFolder)) {
      fs.mkdirSync(proxyFolder)
    }

    const proxyFilePath = path.join(proxyFolder, `${uniqueName}.mp4`)

    // Verifica se o arquivo já existe
    if (fs.existsSync(outputFilePath) && fs.existsSync(proxyFilePath)) {
      console.log('Cut and proxy already exist.')
      return res.status(200).send({
        message: 'Cut and proxy already exist',
        outputFilePath,
        proxyFilePath,
      })
    }

    const ffmpegCutCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -c:v libx264 -c:a aac -strict experimental "${outputFilePath}"`
    exec(ffmpegCutCommand, cutError => {
      if (cutError) {
        console.error('Error cutting video:', cutError)
        return res.status(500).send({ message: 'Error cutting video' })
      }

      console.log('Cutting finished')

      if (!fs.existsSync(proxyFilePath)) {
        const ffmpegProxyCommand = `ffmpeg -i "${outputFilePath}" -vf "scale=640:trunc(ih/2)*2" -c:v libx264 -c:a aac -b:a 128k -ac 2 "${proxyFilePath}"`
        exec(ffmpegProxyCommand, proxyError => {
          if (proxyError) {
            console.error('Error creating proxy:', proxyError)
            return res.status(500).send({ message: 'Error creating proxy' })
          } else {
            console.log('Proxy created:', proxyFilePath)
            return res.status(200).send({
              message: 'Cut and proxy creation successful',
              outputFilePath,
              proxyFilePath,
            })
          }
        })
      } else {
        console.log('Proxy already exists:', proxyFilePath)
        return res.status(200).send({
          message: 'Cutting successful, proxy already exists',
          outputFilePath,
          proxyFilePath,
        })
      }
    })
  })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
