const express = require('express')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const app = express()
const port = 3000

const videosPath = 'E:/series'

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
          if (file.endsWith('.mp4')) {
            allVideos.push(path.join(folderPath, file))
          }
        })
      }
    })

    const randomVideos = []
    for (let i = 0; i < 10; i++) {
      const videoPathRandom =
        allVideos[Math.floor(Math.random() * allVideos.length)]
      randomVideos.push(videoPathRandom)
    }

    res.json(randomVideos)
  })
})

app.get('/stream', (req, res) => {
  const videoPath = req.query.path
  const start = req.query.start
  const end = req.query.end

  if (!videoPath || !start || !end) {
    console.error('Missing required query parameters')
    return res.status(400).send('Missing required query parameters')
  }

  const tempFilePath = path.join(__dirname, 'temp', `temp_${Date.now()}.mp4`)
  const ffmpegCommand = `ffmpeg -i "${videoPath}" -ss ${start} -to ${end} -c copy "${tempFilePath}"`

  console.log(`Executing command: ${ffmpegCommand}`)
  exec(ffmpegCommand, (error, stdout, stderr) => {
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

app.post('/cut', (req, res) => {
  const videoPath = req.query.path
  const start = req.query.start
  const end = req.query.end

  if (!videoPath || !start || !end) {
    console.error('Missing required query parameters')
    return res.status(400).send('Missing required query parameters')
  }

  const outputFolder = path.join(__dirname, 'output')
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }

  const outputFilePath = path.join(outputFolder, `cut_${Date.now()}.mp4`)
  const ffmpegCommand = `ffmpeg -i "${videoPath}" -ss ${start} -to ${end} -c copy "${outputFilePath}"`

  console.log(`Executing command: ${ffmpegCommand}`)
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error cutting video:', error)
      console.error('stderr:', stderr)
      return res.status(500).send('Error cutting video')
    }

    console.log('Cutting finished')
    exec(`explorer.exe /select,"${outputFilePath.replace(/\//g, '\\')}"`)
    res.json({ message: 'Cutting finished', outputFilePath })
  })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
