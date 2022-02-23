function create_zoomedWaveform() {
    const properties = { height: 300, channels: [0, 1], colors: ['#d88', '#8d8'] }

    const eventListeners = [{
        type: 'move', listener: (canvas, ctx, start, current) => {
            if (start) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.fillStyle = '#239bdb66'
                ctx.fillRect(start.x, 0, current.x - start.x, canvas.height)
                drawPlayhead(current, true)
            } else drawPlayhead(current)
        }
    }, {
        type: 'click', listener: (canvas, ctx, start, current) => {
            if (eventFunctions.copy) {
                copyToPosition(current.s)
                return
            }

            if (Math.abs(current.x - start.x) <= 5) {
                audio.currentTime = current.s
                if (audio.paused) audio.play()
            } else editor.setTime(Math.min(start.s, current.s), Math.max(start.s, current.s))
        }
    }, {
        type: 'ctxclick', listener: () => audio.paused ? audio.currentTime = 0 : audio.pause()
    }, {
        type: 'leave', listener: (canvas, ctx, start, current) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            eventsEditor.mouseEvents.ctx.clearRect(0, 0, eventsEditor.WIDTH, eventsEditor.HEIGHT)
            if (start && Math.abs(current.x - start.x) > 5) editor.setTime(Math.min(start.s, current.s), Math.max(start.s, current.s))
        }
    }]

    zoomedWaveform = editor.createCanvas('waveform', properties, eventListeners)
}