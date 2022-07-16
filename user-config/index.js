const { userLogin } = require('./config')
const db = require('./db')

function findUserData(userLogin) {
  return db.find(v => v.userLogin === userLogin)
}

const userData = findUserData(userLogin)

function userTheme(userData) {
  if (userData.userTheme === 'dark') {
    return '🌑'.repeat(50)
  }
  if (userdata.userTheme === 'light') {
    return '🌞'
  } else "you don't have a theme "
}
console.log(`your password is: ${userData.userPassword}`)
console.log(`your age is: ${userData.userAge}`)
console.log(`your userName is: ${userData.userName}`)
console.log(userTheme(userData))
