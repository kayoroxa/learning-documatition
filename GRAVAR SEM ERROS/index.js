import { Noise } from './noise.js'

const script = `
Atualmente estamos menos entediados do que nossos ancestrais costumavam estar, mas temos muito mais medo do tédio. O tédio é algo que a maioria de nós procura evitar de alguma forma. 

Temos medo dele, enfrentar todos os pensamentos indesejados que ocupam a mente pode ser muito difícil. Mas o tédio, quando usado certo, é na verdade uma bênção disfarçada, podendo nos dar uma chance de mudança surpreendente.

…

Hoje em dia , vivemos em um mundo onde as pessoas constantemente lutam para escapar do tédio.  Muitos de nós tentam de tudo para evitar o tédio, preenchendo seu tempo com atividades insignificantes. Preferimos fazer qualquer coisa a ficar entediados. 


As pessoas têm tanto medo de ficar sozinhas com seus próprios pensamentos, sem saber que,  o tédio pode, de fato, ser muito desconfortável e por isso, muitas vezes categorizamos ele como um verdadeiro vilão. 

Porém, o tédio, pode ser o gatilho para um ganho exponencial na nossa criatividade e nossa descobertas sobre nós mesmos.

Mas aí, o que dizer então, agora que a maioria das pessoas mal consegue ir ao banheiro sem pegar o telefone?

…

Veja bem, tentando constantemente escapar do tédio, você cria uma incapacidade de ficar sozinho com seus pensamentos. Como resultado, você perde o contato consigo mesmo e com o que deseja na vida. 

Sua criatividade provavelmente diminuirá para zero, já que não está dando tempo para sua mente refletir e chegar em novos lugares. Neste caso, como você espera ter uma grande ideia?

Escapar do tédio também terá um impacto significativo em sua concentração. Se você estiver constantemente entorpecido por atividades que criam fortes aumentos de dopamina e prazer, tudo o mais parecerá entediante e sem sentido. 

No entanto, se você passar muito tempo sozinho, entediado com seus próprios pensamentos, a maioria das atividades que sabe que precisa fazer, mas não faz porque podem parecer chatas, serão muito mais fáceis de executar. 

Construir um negócio, estudar e outras tarefas difíceis exigirão muito menos esforço mental para serem realizadas, pois todas elas com certeza pareceram mais emocionantes do que ficar sozinho com seus próprios pensamentos. 


É uma forma inteligente de você usar o mecanismo de luta ou fuga do seu cérebro, ao seu favor, é quase como virar um hacker mental.
`
  .trim()
  .split(/\n+/g)

function Render() {
  const noise = Noise()
  const paragraphDiv = document.querySelector('#paragraph')
  const indexDiv = document.querySelector('#index')
  let index = Number(localStorage.getItem('index') || 0)

  indexDiv.textContent = `${index + 1}/${script.length}`
  paragraphDiv.textContent = script[index]

  function next() {
    index = Math.min(index + 1, script.length - 1)
    indexDiv.textContent = `${index + 1}/${script.length}`
    paragraphDiv.textContent = script[index]
    noise.next()
    localStorage.setItem('index', index)
  }

  function prev() {
    index = Math.max(index - 1, -1)
    indexDiv.textContent = `${index + 1}/${script.length}`
    paragraphDiv.textContent = script[index]
    noise.next()
    localStorage.setItem('index', index)
  }

  return {
    next,
    prev,
    mistake: noise.mistake,
  }
}

const render = Render()

document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'd') {
    render.next()
  }
  if (e.key.toLowerCase() === 'a') {
    render.prev()
  }
  if (e.key.toLowerCase() === 'r') {
    render.mistake()
  }
})
