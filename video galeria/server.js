const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const app = express()
const port = 3000

const videosPath = 'D:/Herbert/Create videos/Assets - DB/Videos/Filmes e videos'

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')))

app.get('/videos', (req, res) => {
  fs.readdir(videosPath, (err, folders) => {
    if (err) {
      console.error('Error reading video directory:', err)
      return res.status(500).send('Error reading video directory')
    }

    let allVideos = []
    folders.forEach(folder => {
      const folderPath = path.join(videosPath, folder)
      if (fs.lstatSync(folderPath).isDirectory()) {
        fs.readdirSync(folderPath).forEach(file => {
          if (
            file.endsWith('.mp4') ||
            file.endsWith('.mkv') ||
            file.endsWith('.avi')
          ) {
            allVideos.push(path.join(folderPath, file))
          }
        })
      }
    })

    const shuffledVideos = allVideos.sort(() => 0.5 - Math.random())
    const randomVideos = shuffledVideos.slice(0, 12)

    // for (let i = 0; i < 10; i++) {
    //   const videoPathRandom =
    //     allVideos[Math.floor(Math.random() * allVideos.length)]
    //   randomVideos.push(videoPathRandom)
    // }

    res.json(randomVideos)
  })
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

app.post('/cut', (req, res) => {
  const videoPath = req.query.path
  const startPercent = parseFloat(req.query.start)
  const clipDuration = parseFloat(req.query.clipDuration)
  const action = req.query.action // Novo parâmetro para diferenciar ações

  if (!videoPath || isNaN(startPercent) || isNaN(clipDuration)) {
    console.error('Missing required query parameters')
    return res.status(400).send('Missing required query parameters')
  }

  // Get the duration of the video using ffprobe
  const ffprobeCommand = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
  exec(ffprobeCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error getting video duration:', error)
      console.error('stderr:', stderr)
      return res.status(500).send('Error getting video duration')
    }

    const durationInSeconds = parseFloat(stdout)
    if (isNaN(durationInSeconds)) {
      console.error('Could not parse video duration')
      return res.status(500).send('Could not parse video duration')
    }

    const startTime = startPercent * durationInSeconds
    const endTime = Math.min(startTime + clipDuration, durationInSeconds)

    const outputFolder = path.join(__dirname, 'output')
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder)
    }

    const outputFilePath = path.join(outputFolder, `cut_${Date.now()}.mp4`)
    const ffmpegCutCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -c copy "${outputFilePath}"`

    console.log(`Executing command: ${ffmpegCutCommand}`)
    exec(ffmpegCutCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Error cutting video:', error)
        console.error('stderr:', stderr)
        return res.status(500).send('Error cutting video')
      }

      console.log('Cutting finished')

      // Verificar o parâmetro `action` para decidir se deve abrir a pasta
      if (action === 'open') {
        exec(
          `explorer.exe /select,"${outputFilePath.replace(/\//g, '\\')}"`,
          err => {
            if (err) {
              console.error('Error opening file explorer:', err)
            }
          }
        )
      }

      res.json({ message: 'Cutting finished', outputFilePath })
    })
  })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
