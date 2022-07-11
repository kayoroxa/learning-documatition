function banco() {
  let valor = 0
  let dadosDosClientes = []

  function virus() {
    dadosDosClientes.push(valor)
  }

  return {
    virus,
    nome: dinheiro => {
      valor += dinheiro
      virus()
    },
    mais: () => {
      console.log(valor++, valor)
    },
  }
}

const b = banco()

console.log(b)
