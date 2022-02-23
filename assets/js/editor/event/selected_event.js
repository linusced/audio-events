const eventsData = {
    visibleEvents: [],
    activeEvent: -1,
    update_eventForm: null
}, eventFunctions = {
    copy: false,
    loop: false,
    beats: false,
    math: false,
    add: false,
    remove: false
}

function select_event(time, index) {
    if (index >= 0) eventsData.activeEvent = index
    else {
        eventsData.activeEvent = -1
        for (let i = 0; i < eventsData.visibleEvents.length; i++) {
            const eventTime = getEventTime(events[eventsData.visibleEvents[i]])
            if (time >= eventTime.start && time < eventTime.end) {
                eventsData.activeEvent = eventsData.visibleEvents[i]
                break
            }
        }
    }
    eventsData.update_eventForm()
    editor.update()
}

function create_eventForm() {
    const form = document.querySelector('#event-form'), automationElement = form.querySelector('#event-automation')

    document.addEventListener('contextmenu', e => {
        if (eventFunctions.copy) {
            e.preventDefault()
            eventFunctions.copy = false
            document.querySelector('#event-copy').classList.remove('active')
            document.querySelector('#event-copy-prompt').classList.add('hidden')
        }
        if (eventFunctions.loop) {
            e.preventDefault()
            eventFunctions.loop = false
            document.querySelector('#event-loop').classList.remove('active')
            document.querySelector('#event-loop-prompt').classList.add('hidden')
        }
        if (eventFunctions.beats) {
            e.preventDefault()
            eventFunctions.beats = false
            document.querySelector('#event-beats').classList.remove('active')
            document.querySelector('#event-beats-prompt').classList.add('hidden')
        }
    })

    function update() {
        Object.keys(eventFunctions).forEach(key => eventFunctions[key] = false)

        if (eventsData.activeEvent === -1) return document.querySelector('#selected-event').classList.add('hidden')

        const e = events[eventsData.activeEvent]
        document.querySelector('#selected-event').classList.remove('hidden')

        form.time.value = e.time
        form.time.max = audio.duration
        form.color.value = e.color

        automationElement.innerHTML = ''
        e.automation.forEach((a, i) => automationElement.innerHTML += `<div data-automation-index="${i}"><p>Automation ${i}: Time & Alpha * Required</p><div class="form-group inputs"><input type="number" name="automation-time-${i}" step="any" min="0" max="${audio.duration}" value="${a.time}" required><input type="number" name="automation-alpha-${i}" step="any" min="0" max="1" value="${a.alpha}" required></div><div class="hover-bg"></div><div class="hover-bg-2">Insert new item here</div></div>`)
    }

    create_addAutomation(form, automationElement)
    create_removeAutomation(form, automationElement)

    form.addEventListener('submit', e => {
        e.preventDefault()
        const event = { time: parseFloat(form.time.value), color: form.color.value, automation: [] }
        for (let i = 0; i < automationElement.querySelectorAll('[data-automation-index]').length; i++) event.automation.push({ time: parseFloat(form['automation-time-' + i].value), alpha: parseFloat(form['automation-alpha-' + i].value) })
        setEvent(eventsData.activeEvent, event)
    })
    form.addEventListener('reset', () => {
        document.querySelector('#selected-event').classList.add('hidden')
        const index = eventsData.activeEvent
        eventsData.activeEvent = -1
        deleteEvent(index)
    })
    return update
}