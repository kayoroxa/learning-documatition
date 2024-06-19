const py = require('../../run_py')

const punctuationParser = texts => py(__dirname + '/text_punctuation.py', texts)

const fs = require('fs')

const txt = fs.readFileSync(__dirname + '/text.txt', { encoding: 'utf-8' })

const texts = [txt, 'another example text that needs punctuation']

const srtToString = require('./srtToTxt')

const subtitlesFolder = __dirname + '/subtitles'

const filesPath = fs.readdirSync(subtitlesFolder).map(file => {
  return subtitlesFolder + '/' + file
})

const allTexts = srtToString(filesPath)

async function main() {
  const result = await punctuationParser(allTexts.slice(0, 4))

  console.log('Texts with punctuation:', result)
}

main()
