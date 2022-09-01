const MLR = require('ml-regression-multivariate-linear')

const x = [
  [0, 0],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [10, 3],
  [121, 43],
]
// Y0 = X0 * 2, Y1 = X1 * 2, Y2 = X0 + X1

const y = x.map(d => [
  d[0] * 2,
  d[1] * 2,
  d[0] + d[1],
  (d[0] + d[1]) * 4,
  ((d[0] + d[1]) * 4) ** 3,
])

console.log(288 ** 3)

const mlr = new MLR(x, y)

const result = mlr.predict([70, 2])

// console.log(mlr)

// function AI(prever, ...yData) {
//   const knowX = yData.map(d => d[0])
//   const knowY = yData.map(d => d[1])

//   const mlr = new MLR(knowX, knowY)

//   console.log()
//   const result = mlr.predict(prever)
// }

const arredondado = result.map(r => Math.round(r))

console.log(result)
console.log(arredondado)

// [6, 6, 6]
