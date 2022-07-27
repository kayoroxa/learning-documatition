const dict = [
  { p: ['i'], codes: ['do', "don't", 'am'] },
  { p: ['you', 'we', 'they', 'guys'], codes: ['do', "don't", 'are'] },
  { p: ['he', 'she', 'it', 'mom'], codes: ['does', "doesn't", 'is'] },
]

// const frase = ['do | does', 'i', 'do', 'that', '?']
const frase = ['am | are | is', 'they', 'doing', 'that', '?']

function codeFinder(frase) {
  const newFrase = frase.reduce((acc, word) => {
    if (word.includes('|')) {
      const codesInFrase = word.split(/\s\|\s|\|/)
      const suj = frase.find(w => dict.some(d => d.p.includes(w)))
      const lastCode = codesInFrase[codesInFrase.length - 1]

      const sujDict = dict.find(d => d.p.some(p => p === suj))
      const code = sujDict?.codes.find(codeInSujDict =>
        codesInFrase.some(codeInFrase => codeInFrase === codeInSujDict)
      )

      if (!suj || !sujDict || !code) return [...acc, lastCode]

      return [...acc, code]
    } else {
      acc.push(word)
    }
    return acc
  }, [])

  return newFrase
}

console.log(codeFinder(frase))
