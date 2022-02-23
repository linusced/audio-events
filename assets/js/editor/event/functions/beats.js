addEventListener('load', () => {
    document.querySelector('#event-beats').addEventListener('click', () => {
        if (eventFunctions.copy || eventFunctions.loop || eventFunctions.beats || eventFunctions.math) return
        eventFunctions.beats = true

        document.querySelector('#event-copy-prompt').classList.add('hidden')
        document.querySelector('#event-loop-prompt').classList.add('hidden')
        document.querySelector('#event-beats-prompt').classList.remove('hidden')
        document.querySelector('#event-math-prompt').classList.add('hidden')

        document.querySelector('#event-beats').classList.add('active')
    })

    document.querySelector('#event-beats-confirm').addEventListener('click', () => {
        if (eventFunctions.beats) {
            document.querySelector('#event-beats-prompt').classList.add('hidden')
            document.querySelector('#event-beats').classList.remove('active')

            const beat_length = editor.beats.beat, startTime = Math.round(events[eventsData.activeEvent].time / beat_length) * beat_length
            let amount, endTime
            if (document.querySelector('#event-beats-type').value === 'amount') amount = Math.floor(parseFloat(document.querySelector('#event-beats-value').value) * editor.beats.signature)
            else {
                endTime = parseFloat(document.querySelector('#event-beats-value').value)
                amount = Math.round(((Math.floor(endTime / beat_length) * beat_length) - startTime) / beat_length)
            }
            let minAlpha = parseFloat(document.querySelector('#event-beats-minAlpha').value), maxAlpha = parseFloat(document.querySelector('#event-beats-maxAlpha').value)

            if (amount < 1) amount = 1
            if (minAlpha < 0) minAlpha = 0
            else if (minAlpha > 1) minAlpha = 1
            if (maxAlpha < 0) maxAlpha = 0
            else if (maxAlpha > 1) maxAlpha = 1

            const event = { time: startTime - .1, color: events[eventsData.activeEvent].color, automation: [] }, automation = event.automation

            for (let i = 0; i < amount; i++) {
                const time = startTime + i * beat_length
                if (i > 0) automation.push({ time: time - .1, alpha: minAlpha })
                automation.push({ time: time, alpha: maxAlpha })
            }
            automation.push({ time: endTime || automation.last().time + beat_length - .1, alpha: 0 })

            setEvent(eventsData.activeEvent, event)
            eventsData.update_eventForm()
            editor.update()

            eventFunctions.beats = false
        }
    })
})