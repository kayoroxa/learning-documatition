function seededRandom(seed) {
  let state = seed

  return function () {
    console.log(state)
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

const _player = {
  firstName: ['cristiano', 'benzema', 'messi', 'neymar', 'chavez'],
  lastName: [
    'ronaldo',
    'gonsalvez',
    'josé',
    'campos',
    'martin',
    'rocha',
    'silva',
    'severino',
    'bezerro',
    'orlando',
    'figueiredo',
    'rodriguez',
    'guedes',
  ],
}

const random = seededRandom(20)

function Time(nome, saldoInicial, nomeStadium, corLogo) {
  let saldo = saldoInicial
  let id = random() * 100000
  let jogadores = Array(5)
    .fill(null)
    .map(
      () =>
        _player.firstName[Math.floor(random() * _player.firstName.length)] +
        ' ' +
        _player.lastName[Math.floor(random() * _player.lastName.length)] +
        ' ' +
        Math.round(random() * 100)
    )

  return {
    getSaldo() {
      console.log(`Seu time ${nome} está com o saldo: ${saldo}`)
    },
    setStadiumName(newStadiumName) {
      nomeStadium = newStadiumName
    },
    getStatistics() {
      console.log(`O time ${nome} está na ${nomeStadium} com o saldo: ${saldo}`)
      console.log(`O nome do stadium é: ${nomeStadium} de logo ${corLogo}`)
      console.log(`----\njogadores:\n${jogadores.join('\n')}\n----`)
    },
    addPlayer(name) {
      jogadores.push(name)
    },
    excluirPlayer(name) {
      const index = jogadores.indexOf(name)
      if (index !== -1) {
        jogadores.splice(index, 1)
      }
    },
    setSaldo(newSaldo) {
      saldo = newSaldo
    },
    getId() {
      return id
    },
    nome,
  }
}

function Advocation() {
  return {
    playerTransfer(nome, TimeFrom, TimeTo, valor) {
      console.log(`=== TRANSFERÊNCIA DO DIA ===\n`)
      TimeFrom.excluirPlayer(nome)
      TimeTo.addPlayer(nome)
      console.log(
        `O jogador ${nome} transferiu do time ${TimeFrom.nome} para o time ${TimeTo.nome} por R$ ${valor}`
      )
      console.log(`======\n`)
    },
  }
}

const barcelona = Time('Barcelona', 1000, 'Camp Nou', 'red')
const real = Time('Real Madrid', 1000, 'Santiago Bernabéu', 'blue')
const SpanishAdvocation = Advocation()

console.clear()
barcelona.getStatistics()
console.log('\n')
real.getStatistics()
console.log('\n')
SpanishAdvocation.playerTransfer('cristiano josé 20', real, barcelona, 2000)
barcelona.getStatistics()
console.log('\n')
real.getStatistics()
