function create_addAutomation(form, automationElement) {
    form.querySelector('#add-automation').addEventListener('click', () => {
        if (eventFunctions.add) return
        eventFunctions.add = true
        form.querySelector('#add-automation').classList.add('active')
        const bottomElement = document.createElement('div')
        bottomElement.setAttribute('data-automation-index', document.querySelectorAll('[data-automation-index]').length)
        bottomElement.className = 'bottom'
        bottomElement.innerHTML = '<div class="hover-bg"></div><div class="hover-bg-2">Insert new item here</div>'
        automationElement.appendChild(bottomElement)

        automationElement.querySelectorAll('[data-automation-index]').forEach(div => {
            div.classList.add('add')
            div.addEventListener('click', addDiv)
        })
        addEventListener('contextmenu', cancel)

        function addDiv(e) {
            let index, element
            const elemList = [e.target, e.target.parentElement, e.target.parentElement.parentElement]
            for (let i = 0; i < elemList.length; i++) if (elemList[i].getAttribute('data-automation-index')) {
                index = parseInt(elemList[i].getAttribute('data-automation-index'))
                element = elemList[i]
                break
            }

            document.querySelectorAll('[data-automation-index]').forEach(div => {
                const value = parseInt(div.getAttribute('data-automation-index'))
                if (value >= index && !div.classList.contains('bottom')) {
                    div.setAttribute('data-automation-index', value + 1)
                    div.querySelector('p').innerHTML = div.querySelector('p').innerHTML.replace(value, value + 1)
                    div.querySelectorAll('input').forEach(input => input.name = input.name.replace(value, value + 1))
                }
            })

            const _new = document.createElement('div')
            _new.setAttribute('data-automation-index', index)
            _new.innerHTML = `<p>Automation ${index}: Time & Alpha * Required</p><div class="form-group inputs"><input type="number" name="automation-time-${index}" step="any" min="0" max="${audio.duration}" required><input type="number" name="automation-alpha-${index}" step="any" min="0" max="1" required></div><div class="hover-bg"></div><div class="hover-bg-2">Insert new item here</div>`
            automationElement.insertBefore(_new, element)
            _new.querySelector('input').focus()

            cancel()
        }
        function cancel(e) {
            if (e) e.preventDefault()
            removeEventListener('contextmenu', cancel)
            form.querySelector('#add-automation').classList.remove('active')
            automationElement.removeChild(bottomElement)
            automationElement.querySelectorAll('[data-automation-index]').forEach(div => {
                div.classList.remove('add')
                div.removeEventListener('click', addDiv)
            })
            eventFunctions.add = false
        }
    })
}