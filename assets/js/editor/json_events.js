const mementos = [], mementos_redo = []

function addEvent(newEvent) {
    save_memento()

    newEvent.automation.sort((a, b) => a.time - b.time)
    for (let i = 0; i < newEvent.automation.length; i++) {
        newEvent.automation[i].time = Math.round(newEvent.automation[i].time * 10 ** 3) / 10 ** 3
        newEvent.automation[i].alpha = Math.round(newEvent.automation[i].alpha * 10 ** 2) / 10 ** 2
    }

    events.push(newEvent)
    events.sort((a, b) => a.time - b.time)

    eventsData.update_eventForm()
    editor.update()
    return events.indexOf(newEvent)
}

function setEvent(index, newEvent) {
    save_memento()

    newEvent.automation.sort((a, b) => a.time - b.time)
    for (let i = 0; i < newEvent.automation.length; i++) {
        newEvent.automation[i].time = Math.round(newEvent.automation[i].time * 10 ** 3) / 10 ** 3
        newEvent.automation[i].alpha = Math.round(newEvent.automation[i].alpha * 10 ** 2) / 10 ** 2
    }
    events[index] = newEvent

    eventsData.update_eventForm()
    editor.update()
}

function deleteEvent(index) {
    save_memento()

    events.splice(index, 1)

    eventsData.update_eventForm()
    editor.update()
}

function save_memento() {
    mementos.push([...events])
    if (mementos.length > 5) mementos.shift()
}
function save_memento_redo() {
    mementos_redo.push([...events])
    if (mementos_redo.length > 5) mementos_redo.shift()
}

function undo() {
    const lastMemento = mementos.pop()
    if (lastMemento) {
        save_memento_redo()

        events = lastMemento

        eventsData.activeEvent = -1
        eventsData.update_eventForm()
        editor.update()
    }
}
function redo() {
    const lastMemento = mementos_redo.pop()
    if (lastMemento) {
        save_memento()

        events = lastMemento

        eventsData.activeEvent = -1
        eventsData.update_eventForm()
        editor.update()
    }
}