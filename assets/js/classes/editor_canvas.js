class EditorCanvas {
    constructor(timeWrapper = WaveformEditor.prototype || { startTime: 0, endTime: 0 }, container = HTMLElement.prototype, size = { widthPercentage: 0, height: 0 }, zoom = { bool: true, color: '' }, time = { bool: true, format: false }) {
        this.wrapper = timeWrapper
        this.container = container
        this.canvas = container.querySelector('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.widthMult = size.widthPercentage
        this.canvas.height = size.height
        this.zoom = !zoom.bool && this.wrapper.constructor.name === 'WaveformEditor' ? false : true
        if (!this.zoom) {
            const canvas = document.createElement('canvas')
            canvas.height = size.height
            canvas.style = 'position:absolute;top:0;left:0'
            this.canvas.style.zIndex = 1
            this.container.appendChild(canvas)
            this.zoomElement = { canvas: canvas, ctx: canvas.getContext('2d'), color: zoom.color || '#600' }
        }
        this.displayTime = time.bool
        if (this.displayTime) this.formatTime = time.format
        this.prev = { startTime: this.zoom ? this.wrapper.startTime : this.wrapper.minTime, endTime: this.zoom ? this.wrapper.endTime : this.wrapper.maxTime, currentTime: 0 }
        this.snap = { x: null, y: null }
        this.verticalSnap = this.verticalPadding = 0
    }
    get WIDTH() {
        return this.canvas.width
    }
    get HEIGHT() {
        return this.canvas.height
    }
    /**
     * @param {(startTime: Number, endTime: Number) => Promise} inheritCallback Callback to the update function of the class which inherits this class 
     */
    async update(inheritCallback) {
        this.canvas.width = innerWidth * this.widthMult
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        const startTime = this.zoom ? this.wrapper.startTime : this.wrapper.minTime, endTime = this.zoom ? this.wrapper.endTime : this.wrapper.maxTime
        this.snap.x = this.snap.y = null
        if (this.wrapper.snap) this.snap.y = this.verticalSnap
        if (this.wrapper.beats.bpm > 0 && this.wrapper.minTime === 0) {
            if (this.wrapper.snap) this.snap.x = this.wrapper.beats._4th
            this.ctx.fillStyle = '#aaa'
            let barWidth = 4
            if (endTime - startTime <= 10) for (var s = 0; s < endTime; s += this.wrapper.beats._4th) { if (s >= startTime) this.ctx.fillRect(EditorCanvas.getOffsetX_for_time(s, startTime, endTime, this.WIDTH), 0, 1, this.HEIGHT) }
            else barWidth = 2
            if (endTime - startTime <= 30) for (var s = 0; s < endTime; s += this.wrapper.beats.beat) { if (s >= startTime) this.ctx.fillRect(EditorCanvas.getOffsetX_for_time(s, startTime, endTime, this.WIDTH) - (barWidth === 2 ? 0 : 1), 0, barWidth === 2 ? 1 : 2, this.HEIGHT) }
            else barWidth = 1
            for (var s = 0; s < endTime; s += this.wrapper.beats.bar) if (s >= startTime) this.ctx.fillRect(EditorCanvas.getOffsetX_for_time(s, startTime, endTime, this.WIDTH) - (barWidth === 1 ? 0 : barWidth / 2), 0, barWidth, this.HEIGHT)
        }

        await inheritCallback(startTime, endTime)

        if (this.displayTime) {
            this.ctx.fillStyle = '#000a'
            this.ctx.fillRect(0, 0, 60, 20)
            this.ctx.fillRect(this.WIDTH - 60, 0, 60, 20)
            this.ctx.fillStyle = '#fff'
            this.ctx.font = '20px Arial'
            this.ctx.textBaseline = 'top'
            this.ctx.fillText(this.formatTime ? EditorCanvas.getFormattedTime(startTime) : startTime.toFixed(2), 5, 0, 50)
            this.ctx.fillText(this.formatTime ? EditorCanvas.getFormattedTime(endTime) : endTime.toFixed(2), this.WIDTH - 55, 0, 50)
        }
        if (this.zoomElement) {
            this.zoomElement.canvas.width = innerWidth * this.widthMult
            let x = { start: EditorCanvas.getOffsetX_for_time(this.wrapper.startTime, startTime, endTime, this.WIDTH), end: EditorCanvas.getOffsetX_for_time(this.wrapper.endTime, startTime, endTime, this.WIDTH) }
            if (x.end - x.start < 10) x.end += 10
            this.zoomElement.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
            this.zoomElement.ctx.fillStyle = this.zoomElement.color
            this.zoomElement.ctx.fillRect(x.start, 0, x.end - x.start, this.HEIGHT)
        }
        if (this.mouseEvents) this.mouseEvents.canvas.width = innerWidth * this.widthMult
        if (this.playHead) {
            this.playHead.canvas.width = innerWidth * this.widthMult
            this.drawPlayHead(this.prev.currentTime)
        }
        this.prev.startTime = startTime
        this.prev.endTime = endTime
    }
    /**
     * @param {'click'|'move'|'ctxclick'|'leave'} type
     * @param {(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, start = {x: Number, y: Number, y_percentage: Number, s: Number}, current = {x: Number, y: Number, y_percentage: Number, s: Number}, e: MouseEvent} listener
     */
    addEventListener(type, listener) {
        if (!this.mouseEvents) {
            const canvas = document.createElement('canvas')
            canvas.width = innerWidth * this.widthMult
            canvas.height = this.HEIGHT
            canvas.style = 'position:absolute;top:0;left:0;z-index:3'
            this.container.style.cursor = 'crosshair'
            this.container.appendChild(canvas)
            this.mouseEvents = { canvas: canvas, ctx: canvas.getContext('2d'), mousedown: null, onclick: null, onmove: null, onctxclick: null, onleave: null }

            const self = this
            canvas.addEventListener('mousedown', e => this.mouseEvents.mousedown = getCurrent(e))
            canvas.addEventListener('mousemove', e => {
                if (this.mouseEvents.onmove) this.mouseEvents.onmove(this.mouseEvents.canvas, this.mouseEvents.ctx, this.mouseEvents.mousedown, getCurrent(e), e)
            })
            canvas.addEventListener('click', e => {
                if (this.mouseEvents.onclick) this.mouseEvents.onclick(this.mouseEvents.canvas, this.mouseEvents.ctx, this.mouseEvents.mousedown, getCurrent(e), e)
                this.mouseEvents.mousedown = null
            })
            canvas.addEventListener('contextmenu', e => {
                e.preventDefault()
                this.mouseEvents.mousedown = null
                if (this.mouseEvents.onctxclick) this.mouseEvents.onctxclick(this.mouseEvents.canvas, this.mouseEvents.ctx, null, getCurrent(e), e)
            })
            canvas.addEventListener('mouseleave', e => {
                let { offsetX, offsetY } = e
                if (offsetX > canvas.width) offsetX = canvas.width
                else if (offsetX < 0) offsetX = 0
                if (offsetY > canvas.height) offsetY = canvas.height
                else if (offsetY < 0) offsetY = 0
                if (this.mouseEvents.onleave) this.mouseEvents.onleave(this.mouseEvents.canvas, this.mouseEvents.ctx, this.mouseEvents.mousedown, getCurrent({ offsetX: offsetX, offsetY: offsetY }), e)
                this.mouseEvents.mousedown = null
            })
            function getCurrent(e) {
                let x = e.offsetX, y = e.offsetY, y_percentage = EditorCanvas.getPercentage(e.offsetY, self.HEIGHT - self.verticalPadding, self.verticalPadding)
                if (self.snap.x) x = EditorCanvas.getOffsetX_for_time(Math.round(EditorCanvas.getTime_for_offsetX(x, self.prev.startTime, self.prev.endTime, self.WIDTH) / self.snap.x) * self.snap.x, self.prev.startTime, self.prev.endTime, self.WIDTH)
                if (self.snap.y) {
                    y_percentage = Math.round(EditorCanvas.getPercentage(y, self.HEIGHT - self.verticalPadding, self.verticalPadding) / self.snap.y) * self.snap.y
                    y = EditorCanvas.getValue_for_percentage(y_percentage, self.verticalPadding, self.HEIGHT - self.verticalPadding)
                }
                if (y < self.verticalPadding) {
                    y = self.verticalPadding
                    y_percentage = 0
                } else if (y > self.HEIGHT - self.verticalPadding) {
                    y = self.HEIGHT - self.verticalPadding
                    y_percentage = 1
                }
                return { x: x, y: y, y_percentage: y_percentage, s: EditorCanvas.getTime_for_offsetX(x, self.prev.startTime, self.prev.endTime, self.WIDTH) }
            }
        }
        switch (type) {
            case 'click':
                this.mouseEvents.onclick = listener
                break
            case 'move':
                this.mouseEvents.onmove = listener
                break
            case 'ctxclick':
                this.mouseEvents.onctxclick = listener
                break
            case 'leave':
                this.mouseEvents.onleave = listener
                break
        }
    }
    /**
     * @param {Number} time_s 
     * @param {{color: String, width: Number, shadow: Boolean}} options You only need this property the first time you call this function.
     */
    drawPlayHead(time_s, options) {
        if (!this.playHead) {
            const canvas = document.createElement('canvas')
            canvas.width = innerWidth * this.widthMult
            canvas.height = this.HEIGHT
            canvas.style = 'position:absolute;top:0;left:0;z-index:2'
            this.container.appendChild(canvas)
            this.playHead = { canvas: canvas, ctx: canvas.getContext('2d'), options: { color: options?.color || '#239bdb', width: options?.width || 4, shadow: options?.shadow !== undefined ? options.shadow : true } }
        } else if (options) this.playHead.options = { color: options?.color || '#239bdb', width: options?.width || 4, shadow: options?.shadow !== undefined ? options.shadow : true }

        const x = EditorCanvas.getOffsetX_for_time(time_s, this.prev.startTime, this.prev.endTime, this.WIDTH), w = this.playHead.options.width

        this.playHead.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        if (this.playHead.options.shadow) {
            this.playHead.ctx.fillStyle = '#0007'
            this.playHead.ctx.fillRect(0, 0, x, this.HEIGHT)
        }
        this.playHead.ctx.fillStyle = this.playHead.options.color
        this.playHead.ctx.fillRect(x - (w / 2), 0, w, this.HEIGHT)
        this.prev.currentTime = time_s
    }

    static getPercentage(value, max, min) {
        return (value / (max - min)) - (min / (max - min))
    }
    static getValue_for_percentage(percentage, min, max) {
        return percentage * (max - min) + min
    }
    static getTime_for_offsetX(offsetX, minTime, maxTime, width) {
        return Math.round(((offsetX * (maxTime - minTime) / width) + minTime) * 10 ** 3) / 10 ** 3
    }
    static getOffsetX_for_time(time, minTime, maxTime, width) {
        return this.getPercentage(time, maxTime, minTime) * width
    }
    static getFormattedTime(time_s) {
        let min = Math.floor(time_s / 60), sec = Math.floor((time_s / 60 - min) * 60)
        if (min < 10) min = '0' + min
        if (sec < 10) sec = '0' + sec
        return `${min}:${sec}`
    }
}