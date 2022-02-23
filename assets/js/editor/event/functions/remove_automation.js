function create_removeAutomation(form, automationElement) {
    form.querySelector('#remove-automation').addEventListener('click', () => {
        if (eventFunctions.remove || automationElement.querySelectorAll('[data-automation-index]').length < 2) return
        eventFunctions.remove = true
        form.querySelector('#remove-automation').classList.add('active')
        automationElement.querySelectorAll('[data-automation-index]').forEach(div => {
            div.classList.add('remove')
            div.addEventListener('click', removeDiv)
        })
        addEventListener('contextmenu', cancel)

        function removeDiv(e) {
            let index, element
            const elemList = [e.target, e.target.parentElement, e.target.parentElement.parentElement]
            for (let i = 0; i < elemList.length; i++) if (elemList[i].getAttribute('data-automation-index')) {
                index = parseInt(elemList[i].getAttribute('data-automation-index'))
                element = elemList[i]
                break
            }
            automationElement.removeChild(element)

            document.querySelectorAll('[data-automation-index]').forEach(div => {
                const value = parseInt(div.getAttribute('data-automation-index'))
                if (value > index) {
                    div.setAttribute('data-automation-index', value - 1)
                    div.querySelector('p').innerHTML = div.querySelector('p').innerHTML.replace(value, value - 1)
                    div.querySelectorAll('input').forEach(input => input.name = input.name.replace(value, value - 1))
                }
            })
            cancel()
        }
        function cancel(e) {
            if (e) e.preventDefault()
            removeEventListener('contextmenu', cancel)
            form.querySelector('#remove-automation').classList.remove('active')
            automationElement.querySelectorAll('[data-automation-index]').forEach(div => {
                div.classList.remove('remove')
                div.removeEventListener('click', removeDiv)
            })
            eventFunctions.remove = false
        }
    })
}