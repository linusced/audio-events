function create_staticWaveform() {
    const properties = { height: 200, channels: 0, colors: '#fff', zoom: false, zoomColor: '#027', formatTime: true }

    const eventListeners = [{
        type: 'move', listener: (canvas, ctx, start, current) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#239bdb66'
            if (start) ctx.fillRect(start.x, 0, current.x - start.x, canvas.height)
            else {
                let startTime = current.s - (editor.zoom / 2), endTime = current.s + (editor.zoom / 2)
                if (startTime < editor.minTime) {
                    startTime = editor.minTime
                    endTime = startTime + editor.zoom
                } else if (endTime > editor.maxTime) {
                    endTime = editor.maxTime
                    startTime = endTime - editor.zoom
                }
                const x_start = EditorCanvas.getOffsetX_for_time(startTime, editor.minTime, editor.maxTime, canvas.width), x_end = EditorCanvas.getOffsetX_for_time(endTime, editor.minTime, editor.maxTime, canvas.width)
                ctx.fillRect(x_start, 0, x_end - x_start, canvas.height)
            }
            ctx.fillStyle = '#00f'
            ctx.fillRect(current.x - 2, 0, 4, canvas.height)

            ctx.fillStyle = '#000a'
            ctx.fillRect(current.x + 70 > canvas.width ? canvas.width - 70 : current.x, 0, 70, 20)
            ctx.fillStyle = '#fff'
            ctx.font = '20px Arial'
            ctx.textBaseline = 'top'
            ctx.fillText(current.s.toFixed(3), (current.x + 70 > canvas.width ? canvas.width - 70 : current.x) + 5, 0, 70)
        }
    }, {
        type: 'click', listener: (canvas, ctx, start, current) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (Math.abs(current.x - start.x) > 5) editor.setTime(Math.min(start.s, current.s), Math.max(start.s, current.s))
            else if (current.s + (editor.zoom / 2) >= editor.maxTime) editor.startTime = editor.maxTime - editor.zoom
            else editor.startTime = current.s - (editor.zoom / 2)
        }
    }, {
        type: 'leave', listener: (canvas, ctx, start, current) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (start && Math.abs(current.x - start.x) > 5) editor.setTime(Math.min(start.s, current.s), Math.max(start.s, current.s))
        }
    }]

    editor.createCanvas('waveform', properties, eventListeners)
}