const title = document.querySelector('.container-header #title')

var text = title.textContent

title.setAttribute('data-content', text)

console.log(text)
