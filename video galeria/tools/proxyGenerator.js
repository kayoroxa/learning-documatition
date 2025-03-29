const chokidar = require('chokidar')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')

// Diretórios relativos
const inputDir = path.join(__dirname, 'output')
const proxyDir = path.join(inputDir, 'proxy')

// Verifica se a pasta de proxy existe, caso contrário, cria
if (!fs.existsSync(proxyDir)) {
  fs.mkdirSync(proxyDir, { recursive: true })
  console.log(`Pasta de proxy criada: ${proxyDir}`)
}

// Função para criar um proxy
const createProxy = filePath => {
  const fileName = path.basename(filePath)
  const proxyPath = path.join(proxyDir, fileName)

  // Gera o arquivo proxy
  ffmpeg(filePath)
    .output(proxyPath)
    .videoCodec('libx264')
    .size('640x360') // Resolução baixa
    .on('start', () => {
      console.log(`Iniciando criação de proxy para: ${fileName}`)
    })
    .on('end', () => {
      console.log(`Proxy criado: ${proxyPath}`)
    })
    .on('error', err => {
      console.error(`Erro ao criar proxy para ${fileName}:`, err.message)
    })
    .run()
}

// Verifica se o arquivo proxy já existe
const checkAndCreateProxy = filePath => {
  const fileName = path.basename(filePath)
  const proxyPath = path.join(proxyDir, fileName)

  if (!fs.existsSync(proxyPath)) {
    createProxy(filePath)
  } else {
    console.log(`Proxy já existe para: ${fileName}`)
  }
}

// Inicializa o watcher
const watcher = chokidar.watch(inputDir, {
  ignored: /proxy/, // Ignorar a pasta de proxy
  persistent: true,
})

// Evento: novo arquivo adicionado
watcher.on('add', filePath => {
  if (path.extname(filePath).toLowerCase() === '.mp4') {
    checkAndCreateProxy(filePath)
  }
})

// Evento: inicialização concluída
watcher.on('ready', () => {
  console.log('Monitoramento iniciado na pasta:', inputDir)
})
