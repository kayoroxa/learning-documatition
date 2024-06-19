const py = require('../../run_py')

const punctuationParser = texts => py(__dirname + '/text_punctuation.py', texts)

const fs = require('fs')

const txt = fs.readFileSync(__dirname + '/text.txt', { encoding: 'utf-8' })

const texts = [txt, 'another example text that needs punctuation']

async function main() {
  const result = await punctuationParser(texts)

  console.log('Texts with punctuation:', result)
}

main()
