const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

const py = async (script, texts) => {
  return new Promise((resolve, reject) => {
    // Criar um arquivo temporário para armazenar os textos
    const tempFilePath = path.join(os.tmpdir(), 'texts.json')
    fs.writeFileSync(tempFilePath, JSON.stringify(texts), 'utf-8')

    const scriptPath = path.resolve(__dirname, script)

    // Spawn the Python process
    const py = spawn('python', [scriptPath, tempFilePath])

    let output = ''
    let error = ''

    // Collect stdout data
    py.stdout.on('data', data => {
      output += data.toString()
    })

    // Collect stderr data
    py.stderr.on('data', data => {
      error += data.toString()
    })

    // Handle process exit
    py.on('close', code => {
      // Remover o arquivo temporário
      fs.unlinkSync(tempFilePath)

      if (code !== 0) {
        reject(`Python script exited with code ${code}: ${error}`)
      } else {
        try {
          // Parse the JSON output from Python
          const result = JSON.parse(output)
          resolve(result)
        } catch (e) {
          reject(`Error parsing JSON: ${e}`)
        }
      }
    })
  })
}

module.exports = py
