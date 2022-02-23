addEventListener('load', () => {
    document.querySelector('#event-math').addEventListener('click', () => {
        if (eventFunctions.copy || eventFunctions.loop || eventFunctions.beats || eventFunctions.math) return
        eventFunctions.math = true

        document.querySelector('#event-copy-prompt').classList.add('hidden')
        document.querySelector('#event-loop-prompt').classList.add('hidden')
        document.querySelector('#event-beats-prompt').classList.add('hidden')
        document.querySelector('#event-math-prompt').classList.remove('hidden')

        document.querySelector('#event-math').classList.add('active')
    })

    document.querySelector('#event-math-confirm').addEventListener('click', () => {
        if (eventFunctions.math) {
            const multiplier = parseFloat(document.querySelector('#event-math-multiplier').value)

            document.querySelector('#event-math-prompt').classList.add('hidden')
            document.querySelector('#event-math').classList.remove('active')

            const automation = [...events[eventsData.activeEvent].automation]

            for (let a = 0; a < automation.length; a++) automation[a].alpha *= multiplier;

            setEvent(eventsData.activeEvent, { time: events[eventsData.activeEvent].time, color: events[eventsData.activeEvent].color, automation: automation })
            eventsData.update_eventForm()
            editor.update()

            eventFunctions.math = false
        }
    })
})