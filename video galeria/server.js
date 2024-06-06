const { exec } = require('child_process')
const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const port = 3000

const pathVideos = path.join(__dirname, 'videos')

app.use('/videos', express.static(pathVideos))

app.get('/videos-list', (req, res) => {
  const videosDir = pathVideos
  const allVideos = fs.readdirSync(videosDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory')
    }
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ext === '.mp4' || ext === '.webm' || ext === '.ogg'
    })
    return videoFiles
  })

  const randomVideos = allVideos.sort(() => 0.5 - Math.random()).slice(0, 30)

  res.json(randomVideos)
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

app.get('/open-dir', (req, res) => {
  const videoPath = path.join(__dirname, 'videos', req.query.video)
  if (fs.existsSync(videoPath)) {
    const command =
      process.platform === 'win32'
        ? `explorer /select,"${videoPath.replace(/\//g, '\\')}"`
        : `open "${videoPath}"` // For macOS, 'open' command can be used
    exec(command, error => {
      if (error) {
        return res.status(500).send('Error opening directory')
      }
      res.send('Directory opened')
    })
  } else {
    res.status(404).send('Video not found')
  }
})
