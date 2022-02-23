addEventListener('load', () => {
    forEach(document, '.form-group', group => {
        let label = group.querySelector('label'), input = group.querySelector('input')
        if (input.hasAttribute('required')) {
            const labelHTML = label.outerHTML
            group.removeChild(label)
            const labelContent = document.createElement('div')
            labelContent.className = 'form-group-content'
            labelContent.innerHTML = labelHTML + '<p class="form-required"></p>'
            group.insertBefore(labelContent, input)
        }
        const validation = input.getAttribute('data-validation'), inputHTML = input.outerHTML
        group.removeChild(input)
        const inputContent = document.createElement('div')
        inputContent.className = 'form-group-content'
        inputContent.innerHTML = inputHTML + `<p class="form-input-info">${validation != '' ? validation : input.title}</p>`
        group.appendChild(inputContent)
        const p = inputContent.querySelector('p')
        p.style.display = 'block'
        if (p.getBoundingClientRect().bottom >= group.parentElement.getBoundingClientRect().bottom) p.classList.add('top')
        p.style.display = ''
    })
    forEach(document, 'input:not([type="submit"])', input => {
        input.addEventListener('change', e => inputValidity(e.target))
        if (input.value !== '' && input.className === '') inputValidity(input)
    })
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('keydown', e => {
            if (e.code === 'Enter') forEach(form, 'input:not([type="submit"])', input => inputValidity(input))
        })
        form.querySelector('input[type="submit"]').addEventListener('click', () => {
            forEach(form, 'input:not([type="submit"])', input => inputValidity(input))
        })
    }
})
function forEach(element, query, callback) {
    element.querySelectorAll(query).forEach(element => callback(element))
}
function inputValidity(input) {
    if (input.checkValidity()) input.className = 'valid'
    else input.className = 'invalid'
}
function formUpdate() {
    forEach(document, '.form-group', group => {
        const input = group.querySelector('input'), p = group.querySelector('.form-input-info'),
            validation = input.getAttribute('data-validation')
        if (validation != '') {
            p.innerHTML = validation
            input.className = 'invalid'
            input.focus()
            input.addEventListener('change', () => p.innerHTML = input.title)
        }
    })
}