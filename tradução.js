function translation(fraseEn) {
  const dict = [
    //
    ['the first person', 'a primeira pessoa'],
    ['so smart', 'muito inteligente'],
    ['speaking little', 'falando pouco'],
    ['fine', 'bem'],
    ['working hard', 'trabalhando duro'],
    ['doing the work', 'fazendo o trabalho'],
    ['i', 'eu'],
    ['you', 'você'],
    ['he', 'ele'],
    ['she', 'ela'],
    ['we', 'nós'],
    ['you all', 'todos vocês'],
    ['they', 'eles'],
    ['have to', 'tem que'],
    ['has to', 'tem que'],
    ['have', 'tem'],
    ['has', 'tem'],
    ['won', 'ganhou'],
    ['buy', 'compra'],
    ['a car', 'um carro'],
    ['a house', 'uma casa'],
    ['a dog', 'um cachorro'],
    ['a cat', 'um gato'],
    ['a horse', 'um cavalo'],
    ['study', 'estuda'],
    ['go', 'ir'],
    ['work', 'trabalhar'],
    ["don't", 'não'],
    ['buy a house', 'comprar uma casa'],
    ['go to school', 'ir para escola'],
    ['switch cars', 'trocar de carro'],
    ['study', 'estuda'],
    ['why', 'porque'],
    ['when', 'quando'],
    ['where', 'onde'],
    ['do', 'PRESENTE'],
    ['does', 'PRESENTE'],
    ['will', 'FUTURO'],
    ['can', 'pode'],
  ]

  const frase = fraseEn.toLowerCase()

  const fraseTraduzida = dict.reduce((acc, [en, pt]) => {
    const regex = new RegExp(en, 'g')
    return acc.replace(regex, pt)
  }, frase)

  return fraseTraduzida
}

console.log(translation('he have to work'))
