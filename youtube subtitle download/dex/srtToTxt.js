const parser = require('subtitles-parser')

const uniqueArray = arr => [...new Set(arr)]

function removeDuplicatedLinesSrt(srtData) {
  let lastLines = []

  const newSrtData = srtData.map(srt => {
    let currentLines = srt.text.split('\n')

    currentLines = currentLines.filter(line => {
      return !lastLines.includes(line)
    })

    if (currentLines.length > 0) lastLines = currentLines

    return {
      ...srt,
      text: uniqueArray(currentLines).join('\n'),
    }
  })

  return newSrtData.filter(srt => srt.text.length > 0)
}

const subtitlesFolder = __dirname + '/subtitles'

const fs = require('fs')

// const files = fs.readdirSync(subtitlesFolder)

// const filePath = subtitlesFolder + '/' + files[0]

function srtToString(filesPath) {
  const allTexts = []
  for (const filePath of filesPath) {
    const srtTxt = fs.readFileSync(filePath, 'utf8')

    const srtData = removeDuplicatedLinesSrt(parser.fromSrt(srtTxt, true))

    const text = srtData
      .map(srt => srt.text)
      .join('\n')
      .split('\n')
      .filter(line => line.length > 0)
      .join(' ')

    allTexts.push(text)
  }

  return allTexts
}

module.exports = srtToString
//
// console.log(text)

// fs.writeFileSync(__dirname + '/text.txt', text)
//
