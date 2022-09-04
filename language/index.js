const fs = require('fs')

const arquiveString = fs.readFileSync(
  'D:/herbert/Codes/learning-documatition/language/index.artur',
  {
    encoding: 'utf-8',
  }
)

const newArquiveString = arquiveString.replace(
  'mostra na tela > ',
  'console.log'
)

eval(newArquiveString)
