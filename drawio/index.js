const fs = require('fs')
const xml2js = require('xml2js')

// Função para ler o arquivo XML
function readXMLFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

// Função para converter XML em JSON
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser()
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

function findById(json, id) {
  const root = json.mxfile.diagram[0].mxGraphModel[0].root[0].mxCell

  return root.find(cell => cell.$.id === id)
}

function findLabelRelatedByLineId(json, lineId) {
  const root = json.mxfile.diagram[0].mxGraphModel[0].root[0].mxCell

  return root.find(cell => cell.$.parent === lineId)
}

// Função para extrair os nós e as conexões do JSON gerado pelo XML
function extractLinks(json) {
  //fazendo links
  const nodes = {}
  const edges = []

  const root = json.mxfile.diagram[0].mxGraphModel[0].root[0].mxCell

  root.forEach(cell => {
    const isACell = cell.$.vertex === '1' || cell.$.edge === '1'
    if (!isACell) return

    const isLabel = cell.$.connectable && cell.$.style.startsWith('edgeLabel')
    if (isLabel) {
      console.log(cell.$.value, 'is label')
      const linhaParentId = cell.$.parent
      const linha = findById(json, linhaParentId)

      nodes[cell.$.id] = {
        id: cell.$.id,
        value: cell.$.value,
        style: cell.$.style,
      }

      edges.push({
        source: linha.$.source,
        target: cell.$.id,
      })

      edges.push({
        source: cell.$.id,
        target: linha.$.target,
      })
    } else {
      const isLinha = cell.$.edge === '1'
      if (!isLinha) {
        nodes[cell.$.id] = {
          id: cell.$.id,
          value: cell.$.value,
          style: cell.$.style,
        }
      } else if (isLinha && !findLabelRelatedByLineId(json, cell.$.id)) {
        edges.push({
          source: cell.$.source,
          target: cell.$.target,
        })
      }
    }
    if (cell.$.style.includes('rounded=1')) {
      nodes[cell.$.id] = { ...nodes[cell.$.id], main: true }
    }
  })

  return { nodes, edges }
}

// Função principal para realizar a conversão
async function convertDrawioToJSON(xmlFilePath, jsonFilePath) {
  if (!fs.existsSync(xmlFilePath)) {
    console.error('XML file not found:', xmlFilePath)
    return
  }
  try {
    const xmlData = await readXMLFile(xmlFilePath)
    const jsonData = await parseXML(xmlData)
    const { nodes, edges } = extractLinks(jsonData)

    const result = {
      nodes: Object.values(nodes),
      edges: edges,
    }

    fs.writeFileSync(
      jsonFilePath,
      'export const resultJson = ' + JSON.stringify(result, null, 2)
    )
    console.log('Conversion complete. JSON saved to', jsonFilePath)
  } catch (error) {
    console.error('Error during conversion:', error)
  }
}

// <?xml version="1.0" encoding="UTF-8"?>

// Caminhos dos arquivos
const xmlFilePath = __dirname + '/label.drawio' // Caminho do arquivo XML
// const xmlFilePath = 'C:/Users/Fernandes/OneDrive/Habitgrama/30 min work.drawio' // Caminho do arquivo XML
const jsonFilePath = __dirname + '/output.js' // Caminho do arquivo JSON de saída

// Converter XML para JSON
convertDrawioToJSON(xmlFilePath, jsonFilePath)
