var readlineSync = require('readline-sync')

const input = readlineSync.question

function app() {
  // Wait for user's response.
  var userName = input('May I have your name? ')

  console.log(`Hello ${userName}!`)

  var userName = input('May I have your age? ')
  console.log(`You are ${userName} years old!`)

  return app() //repeat the app again
}

app()
