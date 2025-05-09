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
      fullPath.endsWith('.avi') ||
      fullPath.endsWith('.mov') ||
      fullPath.endsWith('.wmv')
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
  const videoPath = req.query.path;
  const startPercent = parseFloat(req.query.start);
  const clipDuration = parseFloat(req.query.clipDuration);

  if (!videoPath || isNaN(startPercent) || isNaN(clipDuration)) {
    console.error('Missing required query parameters');
    return res.status(400).send('Missing required query parameters');
  }

  const ffprobeDurationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
  const ffprobeCodecCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;

  exec(ffprobeDurationCmd, (durationErr, durationStdout) => {
    if (durationErr) {
      console.error('Error getting video duration:', durationErr);
      return res.status(500).send('Error getting video duration');
    }

    const durationInSeconds = parseFloat(durationStdout);
    if (isNaN(durationInSeconds)) {
      console.error('Could not parse video duration');
      return res.status(500).send('Invalid duration info');
    }

    const startTime = startPercent * durationInSeconds;
    const tempFilePath = path.join(__dirname, 'temp', `temp_${Date.now()}.mp4`);

    // Agora detecta o codec
    exec(ffprobeCodecCmd, (codecErr, codecStdout) => {
      if (codecErr) {
        console.warn('⚠️ Erro ao detectar codec, fazendo reencode por segurança.');
        return encodeVideo(); // fallback direto pra segurança
      }

      const codec = codecStdout.trim().toLowerCase();
      console.log(`🎥 Codec detectado: ${codec}`);

      if (codec === 'h264') {
        // tenta o caminho rápido
        const ffmpegCopyCmd = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -movflags +faststart -c copy "${tempFilePath}"`;
        console.log('⚡ Tentando copy...');
        exec(ffmpegCopyCmd, (copyErr) => {
          if (copyErr) {
            console.warn('❌ Copy falhou, tentando reencode...');
            encodeVideo(); // fallback
          } else {
            streamVideoToClient(tempFilePath, req, res);
          }
        });
      } else {
        // codec não é h264, reencode obrigatório
        encodeVideo();
      }
    });

    function encodeVideo() {
      const ffmpegReencodeCmd = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -movflags +faststart -c:v libx264 -preset ultrafast -c:a aac "${tempFilePath}"`;
      console.log('🔁 Reencode forçado com libx264...');
      exec(ffmpegReencodeCmd, (reErr) => {
        if (reErr) {
          console.error('❌ Reencode falhou:', reErr);
          return res.status(500).send('Erro ao gerar vídeo (reencode)');
        }
        streamVideoToClient(tempFilePath, req, res);
      });
    }
  });
});


// 🔁 Aguarda o arquivo estar legível
function waitForFileReady(filePath, maxAttempts = 10, interval = 200) {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const check = () => {
      fs.open(filePath, 'r', (err, fd) => {
        if (!err) {
          fs.close(fd, () => resolve())
        } else {
          if (attempts++ < maxAttempts) {
            setTimeout(check, interval)
          } else {
            reject(new Error('File not ready after multiple attempts'))
          }
        }
      })
    }

    check()
  })
}

// 📤 Envia o vídeo com stream
function streamVideoToClient(tempFilePath, req, res) {
  waitForFileReady(tempFilePath)
    .then(() => {
      res.setHeader('Content-Type', 'video/mp4')
      res.setHeader('Cache-Control', 'no-store')

      const stream = fs.createReadStream(tempFilePath)

      req.on('close', () => {
        console.log('Client disconnected during stream.')
        stream.destroy()
      })

      stream.pipe(res)

      res.on('finish', () => {
        fs.unlink(tempFilePath, err => {
          if (err) console.error('Error deleting temp file:', err)
          else console.log(`Deleted temp file: ${tempFilePath}`)
        })
      })
    })
    .catch(err => {
      console.error('❌ Timeout esperando arquivo pronto:', err)
      res.status(500).send('Erro ao acessar vídeo gerado')
    })
}




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
  const enableProxy = false; // 🔁 Altere para true se quiser ativar criação de proxy

  const videoPath = req.query.path;
  const startPercent = parseFloat(req.query.start);
  const clipDuration = parseFloat(req.query.clipDuration);
  const action = req.query.action;

  if (!videoPath || isNaN(startPercent) || isNaN(clipDuration)) {
    console.error('Missing required query parameters');
    return res.status(400).send('Missing required query parameters');
  }

  const videoName = path.basename(videoPath, path.extname(videoPath)).slice(0, 8); // Pega os primeiros 8 caracteres
  const outputFolder = path.join(__dirname, 'output');
  const proxyFolder = path.join(outputFolder, 'proxy');

  if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);
  if (enableProxy && !fs.existsSync(proxyFolder)) fs.mkdirSync(proxyFolder);

  const startTime = Math.floor(startPercent * 3600); // ajuste se preferir outra base
  const endTime = startTime + Math.floor(clipDuration);

  const baseName = `${videoName}_${startTime}-${endTime}`;
  const tempOutputPath = path.join(outputFolder, `${baseName}.temp.mp4`);
  const finalOutputPath = path.join(outputFolder, `${baseName}.mp4`);
  const proxyPath = path.join(proxyFolder, `${baseName}.mp4`);

  if (fs.existsSync(finalOutputPath) && (!enableProxy || fs.existsSync(proxyPath))) {
    return res.status(200).send({
      message: enableProxy
        ? 'Corte e proxy já existem'
        : 'Corte já existe',
      outputFilePath: finalOutputPath,
      proxyFilePath: enableProxy ? proxyPath : undefined,
    });
  }

  const ffmpegCutCommand = `ffmpeg -ss ${startTime} -i "${videoPath}" -t ${clipDuration} -c:v libx264 -c:a aac -strict experimental "${tempOutputPath}"`;
  exec(ffmpegCutCommand, cutError => {
    if (cutError) {
      console.error('Error cutting video:', cutError);
      return res.status(500).send({ message: 'Erro ao cortar o vídeo' });
    }

    console.log('✅ Corte finalizado:', tempOutputPath);

    fs.rename(tempOutputPath, finalOutputPath, renameErr => {
      if (renameErr) {
        console.error('❌ Erro ao renomear para .mp4:', renameErr);
        return res.status(500).send({ message: 'Erro ao finalizar vídeo' });
      }

      console.log('✅ Arquivo finalizado:', finalOutputPath);

      if (!enableProxy) {
        return res.status(200).send({
          message: 'Corte finalizado com sucesso',
          outputFilePath: finalOutputPath,
        });
      }

      // Proxy ativado:
      if (!fs.existsSync(proxyPath)) {
        const ffmpegProxyCommand = `ffmpeg -i "${finalOutputPath}" -vf "scale=640:trunc(ih/2)*2" -c:v libx264 -c:a aac -b:a 128k -ac 2 "${proxyPath}"`;
        exec(ffmpegProxyCommand, proxyError => {
          if (proxyError) {
            console.error('Error creating proxy:', proxyError);
            return res.status(500).send({ message: 'Corte criado, mas houve erro ao gerar o proxy' });
          }

          console.log('✅ Proxy criado:', proxyPath);
          return res.status(200).send({
            message: 'Corte e proxy criados com sucesso',
            outputFilePath: finalOutputPath,
            proxyFilePath: proxyPath,
          });
        });
      } else {
        console.log('Proxy já existe:', proxyPath);
        return res.status(200).send({
          message: 'Corte finalizado, proxy já existia',
          outputFilePath: finalOutputPath,
          proxyFilePath: proxyPath,
        });
      }
    });
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
