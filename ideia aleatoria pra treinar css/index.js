const title = document.querySelector('.header #title')

var text = title.textContent

title.setAttribute('data-content', text)

console.log(text)
