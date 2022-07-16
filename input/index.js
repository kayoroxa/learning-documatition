var readlineSync = require('readline-sync')

const input = readlineSync.question

function app() {
  // Wait for user's response.
  var userName = input('May I have your name? ')

  console.log(`Hello ${userName}!`)
}

// while true = loop infinito
while (true) {
  app()
}
