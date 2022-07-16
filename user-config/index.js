const { userLogin } = require('./config')
const db = require('./db')

function findUserData(userLogin) {
  return db.find(v => v.userLogin === userLogin)
}
const userData = findUserData(userLogin)

console.log(`your password is: ${userData.userPassword}`)
console.log(`your userName is: ${userData.userName}`)
