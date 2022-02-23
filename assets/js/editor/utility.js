Array.prototype.last = function () {
    return this[this.length - 1]
}

function getEventTime(event_or_index) {
    if (isNaN(event_or_index)) return { start: event_or_index.time, end: event_or_index.automation.last().time }
    else return { start: events[event_or_index].time, end: events[event_or_index].automation.last().time }
}
function getEventsWithinTime(startTime, endTime) {
    const result = []
    for (var i = 0; i < events.length; i++) {
        const { start, end } = getEventTime(i), bounds = start >= startTime && end < endTime ? 'within' : start >= startTime && start < endTime ? 'starts-within' : end >= startTime && end < endTime ? 'ends-within' : start < startTime && end > endTime ? 'outside' : false
        if (bounds) result.push(i)
    }
    return result
}

function drawPlayhead(current, doNotClearZoomed) {
    var { canvas, ctx } = zoomedWaveform.mouseEvents
    if (!doNotClearZoomed) ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0af'
    ctx.fillRect(current.x - 2, 0, 4, canvas.height)

    ctx.fillStyle = '#000a'
    ctx.fillRect(current.x + 70 > canvas.width ? canvas.width - 70 : current.x, 0, 70, 20)
    ctx.fillStyle = '#fff'
    ctx.font = '20px Arial'
    ctx.textBaseline = 'top'
    ctx.fillText(current.s.toFixed(3), (current.x + 70 > canvas.width ? canvas.width - 70 : current.x) + 5, 0, 70)

    var { canvas, ctx } = eventsEditor.mouseEvents
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0af'
    ctx.fillRect(current.x - 2, 0, 4, canvas.height)
}

function highlightActiveEvent() {
    const { ctx, canvas } = eventsEditor.custom

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (eventsData.activeEvent == -1) return
    const event = events[eventsData.activeEvent], startX = x(event.time) - 2, endX = x(event.automation.last().time) + 2
    ctx.fillStyle = '#fff1'
    ctx.fillRect(startX, 0, endX - startX, canvas.height - 8)
    ctx.fillStyle = '#fff'
    ctx.fillRect(startX, 0, 4, canvas.height - 8)
    ctx.fillRect(endX - 4, 0, 4, canvas.height - 8)
    ctx.fillRect(startX, 0, endX - startX, 4)
    ctx.fillRect(startX, canvas.height - 12, endX - startX, 4)

    function x(time) {
        return EditorCanvas.getOffsetX_for_time(time, editor.startTime, editor.endTime, canvas.width)
    }
}

function copyEvent(index) {
    return { time: events[index].time, color: events[index].color, automation: [...events[index].automation] }
}