addEventListener('load', () => {
    document.querySelector('#event-copy').addEventListener('click', () => {
        if (eventFunctions.copy || eventFunctions.loop || eventFunctions.beats || eventFunctions.math) return
        eventFunctions.copy = true

        document.querySelector('#event-copy-prompt').classList.remove('hidden')
        document.querySelector('#event-loop-prompt').classList.add('hidden')
        document.querySelector('#event-beats-prompt').classList.add('hidden')
        document.querySelector('#event-math-prompt').classList.add('hidden')

        document.querySelector('#event-copy').classList.add('active')
    })

    document.querySelector('#event-copy-confirm').addEventListener('click', () => {
        if (eventFunctions.copy) {
            const value = parseFloat(document.querySelector('#event-copy-position').value)
            copyToPosition(value)
        }
    })
})

function copyToPosition(time) {
    document.querySelector('#event-copy-prompt').classList.add('hidden')
    document.querySelector('#event-copy').classList.remove('active')

    const startTime = events[eventsData.activeEvent].time, automation = events[eventsData.activeEvent].automation, newEvent = { time: time, color: events[eventsData.activeEvent].color, automation: [] }
    for (let i = 0; i < automation.length; i++) {
        newEvent.automation.push({ time: time + automation[i].time - startTime, alpha: automation[i].alpha })
    }

    eventsData.activeEvent = addEvent(newEvent)
    eventsData.update_eventForm()
    editor.update()

    eventFunctions.copy = false
}