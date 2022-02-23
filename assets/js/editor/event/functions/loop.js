addEventListener('load', () => {
    document.querySelector('#event-loop').addEventListener('click', () => {
        if (eventFunctions.copy || eventFunctions.loop || eventFunctions.beats || eventFunctions.math) return
        eventFunctions.loop = true

        document.querySelector('#event-copy-prompt').classList.add('hidden')
        document.querySelector('#event-loop-prompt').classList.remove('hidden')
        document.querySelector('#event-beats-prompt').classList.add('hidden')
        document.querySelector('#event-math-prompt').classList.add('hidden')

        document.querySelector('#event-loop').classList.add('active')
    })

    document.querySelector('#event-loop-confirm').addEventListener('click', () => {
        if (eventFunctions.loop) {
            let amount = parseInt(document.querySelector('#event-loop-amount').value)
            if (amount < 1) amount = 1

            document.querySelector('#event-loop-prompt').classList.add('hidden')
            document.querySelector('#event-loop').classList.remove('active')

            const automation = [...events[eventsData.activeEvent].automation], loopData = []
            let startTime = automation[0].time

            for (let a = 0; a < automation.length; a++) loopData.push({ time: automation[a].time - startTime, alpha: automation[a].alpha })
            for (let i = 0; i < amount; i++) {
                startTime = automation.last().time
                for (let l = 0; l < loopData.length; l++) automation.push({ time: loopData[l].time + startTime, alpha: loopData[l].alpha })
            }

            setEvent(eventsData.activeEvent, { time: events[eventsData.activeEvent].time, color: events[eventsData.activeEvent].color, automation: automation })
            eventsData.update_eventForm()
            editor.update()

            eventFunctions.loop = false
        }
    })
})