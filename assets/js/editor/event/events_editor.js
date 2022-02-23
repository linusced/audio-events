function create_eventsEditor() {
    const properties = { height: 150, displayTime: false, verticalSnap: .05, verticalPadding: 20, updateCallback: update_eventsEditor }

    const eventListeners = [{
        type: 'move', listener: (canvas, ctx, start, current) => {
            drawPlayhead(current)

            ctx.fillStyle = '#fff'
            ctx.fillRect(0, current.y - 1, canvas.width, 2)

            const alpha = Math.round((1 - current.y_percentage) * 100) / 100
            ctx.fillStyle = '#000a'
            ctx.fillRect(current.x + 50 > canvas.width ? canvas.width - 50 : current.x, 0, 50, 20)
            ctx.fillStyle = '#fff'
            ctx.font = '20px Arial'
            ctx.textBaseline = 'top'
            ctx.fillText(alpha, (current.x + 50 > canvas.width ? canvas.width - 50 : current.x) + 5, 0, 40)
        }
    }, {
        type: 'click', listener: (canvas, ctx, start, current) => {
            if (eventFunctions.copy) {
                copyToPosition(current.s)
                return
            }

            if (eventsData.activeEvent === -1 || current.s < events[eventsData.activeEvent].time || (eventsData.activeEvent + 1 < events.length && current.s >= events[eventsData.activeEvent + 1].time)) {
                select_event(current.s)
            } else {
                const event = copyEvent(eventsData.activeEvent)
                event.automation.push({ time: current.s, alpha: Math.round((1 - current.y_percentage) * 10 ** 2) / 10 ** 2 })
                setEvent(eventsData.activeEvent, event)
            }
        }
    }, {
        type: 'ctxclick', listener: (canvas, ctx, start, current) => {
            const eventTime = eventsData.activeEvent !== -1 ? getEventTime(eventsData.activeEvent) : null
            if (eventsData.activeEvent === -1 || current.s < eventTime.start || current.s > eventTime.end) {
                const newEvent = { time: current.s, color: '#ffffff', automation: [{ time: current.s + 1, alpha: 0 }] }
                select_event(null, addEvent(newEvent))
            } else {
                const event = copyEvent(eventsData.activeEvent)
                for (let i = 0; i < event.automation.length; i++) {
                    const a = event.automation[i],
                        a_x = EditorCanvas.getOffsetX_for_time(a.time, editor.startTime, editor.endTime, canvas.width), a_y = EditorCanvas.getValue_for_percentage(1 - a.alpha, eventsEditor.verticalPadding, canvas.height - eventsEditor.verticalPadding)
                    if (a_x >= current.x - 10 && a_x < current.x + 10 && a_y >= current.y - 10 && a_y < current.y + 10) {
                        event.automation.splice(i, 1)
                        break
                    }
                }
                setEvent(eventsData.activeEvent, event)
            }
        }
    }, {
        type: 'leave', listener: (canvas, ctx) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const { width, height } = zoomedWaveform.mouseEvents.canvas
            zoomedWaveform.mouseEvents.ctx.clearRect(0, 0, width, height)
        }
    }]

    eventsEditor = editor.createCanvas('custom', properties, eventListeners)
    eventsData.update_eventForm = create_eventForm()
}

function update_eventsEditor(self, canvas, ctx, startTime, endTime, completed) {
    const visibleEvents = eventsData.visibleEvents = getEventsWithinTime(startTime, endTime)
    ctx.lineWidth = 2
    for (var i = 0; i < visibleEvents.length; i++) {
        const event = events[visibleEvents[i]], automation = event.automation, startX = x(event.time) - 2, endX = x(automation.last().time) + 2, rects = []

        ctx.fillStyle = event.color
        ctx.globalAlpha = 1
        ctx.fillRect(startX, 0, endX - startX, self.verticalPadding - 8)
        ctx.fillRect(startX, canvas.height - self.verticalPadding + 8, endX - startX, 4)
        ctx.globalAlpha = event.color === '#ffffff' ? .2 : .5
        ctx.fillRect(startX, self.verticalPadding - 8, endX - startX, canvas.height - self.verticalPadding * 2 + 16)

        var _x = x(event.time), _y = y(0)
        ctx.strokeStyle = '#fff'
        ctx.globalAlpha = .6
        ctx.beginPath()
        ctx.moveTo(_x, _y)
        rects.push({ x: _x, y: _y })
        for (let a = 0; a < automation.length; a++) {
            var _x = x(automation[a].time), _y = y(automation[a].alpha)
            ctx.lineTo(_x, _y)
            rects.push({ x: _x, y: _y })
        }
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        for (let r = 0; r < rects.length; r++) ctx.fillRect(rects[r].x - 2, rects[r].y - 2, 4, 4)
    }
    completed()
    highlightActiveEvent()
    function x(time) {
        return EditorCanvas.getOffsetX_for_time(time, startTime, endTime, canvas.width)
    }
    function y(alpha) {
        return EditorCanvas.getValue_for_percentage(1 - alpha, self.verticalPadding, canvas.height - self.verticalPadding)
    }
}