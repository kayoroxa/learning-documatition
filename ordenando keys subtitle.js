function getDictSort(children) {
  function getNum(cur) {
    if (!cur) return 0
    return cur.match(/\d+/g) ? Number(cur.match(/\d+/g)[0]) : 0
  }

  children = children.map((v, i) => ({ value: v, positionIndex: i }))

  const listSorted = children.sort((a, b) => {
    a = getNum(a.value)
    b = getNum(b.value)
    if (a === 0 || b === 0) return 0
    return a - b
  })

  return listSorted.map((dic, i) => ({
    positionIndex: dic.positionIndex,
    colorIndex: i,
    value: dic.value.replace(/\d/g, ''),
  }))
}

const myColors = [
  //
  'cor1',
  'cor2',
  'cor3',
  'cor4',
  'cor5',
  'cor6',
  'cor7',
  'cor8',
  'cor9',
  // '#00a4eb',
  // '#8ac926',
  // '#ff006e',
  // '#ffbe0b',
  // '#8338ec',
  // '#fb5607',
  // '#00b050',
  // '#ff0000',
  // '#e7e6e6',
]

function keysToSpanStringColors(text) {
  const keys = text.match(/(?<=\{).+?(?=\})/g)

  const dictSort = getDictSort(keys)

  let index = -1

  const spans = text.replace(/\{.*?\}/g, char => {
    index++
    const newChar = char.replace(/[{}\d]/g, '')
    return `<span style="color:${
      myColors[dictSort.find(d => d.positionIndex === index).colorIndex]
    }">${newChar}</span>\n`
  })

  return spans
}

console.log(
  keysToSpanStringColors(
    '{Você} {é} {5um} {6menino} {4tão} {3bom}! {Sim}, {você é}!'
  )
)
