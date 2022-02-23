class WaveformEditor {
    constructor(container = HTMLElement.prototype, waveformBuffer = AudioBuffer.prototype || false, widthPercentage = 1, tempo = { bpm: 0, timeSignature: 4 }, playHead = { audio: HTMLAudioElement.prototype, color: '', width: 0, shadow: true || [true] }, update_callback = self => null, audioContext = new AudioContext()) {
        this.container = container
        this.waveformBuffer = waveformBuffer
        this.ctx = audioContext
        this.values = { startTime: 0, zoom: waveformBuffer.duration || 10, width: widthPercentage || 1 }
        this.minTime = 0
        this.maxTime = waveformBuffer.duration || 0
        this.beats = { bpm: tempo.bpm || 0, signature: tempo.timeSignature || 4, beat: 0, bar: 0, _4th: 0 }
        if (this.beats.bpm > 0) {
            this.beats.beat = 60 / this.beats.bpm
            this.beats.bar = this.beats.beat * this.beats.signature
            this.beats._4th = this.beats.beat / 4
        }
        this.zoomProperties = { min: .1, max: 0 }
        this.snap_bool = false
        this.update_callback = update_callback
        this.canvas_arr = []
        this.resizeTimeout = null
        addEventListener('resize', () => {
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
            this.resizeTimeout = setTimeout(() => this.update(), 500)
        })
        if (playHead) {
            this.playHead = playHead
            this.playHead.frame = null
            this.playHead.audio.addEventListener('play', () => this.playHead.frame = requestAnimationFrame(() => this.timeUpdate()))
            this.playHead.audio.addEventListener('pause', () => cancelAnimationFrame(this.playHead.frame))
            this.playHead.audio.addEventListener('timeupdate', () => this.playHead.audio.paused ? this.timeUpdate(true) : null)
        }
    }
    update() {
        if (!this.zoomProperties.max) this.zoomProperties.max = this.maxTime - this.minTime
        this.canvas_arr.forEach(item => item.update())
        setTimeout(() => this.update_callback(this), 5)
    }
    timeUpdate(timeupdate) {
        this.canvas_arr.forEach((item, index) => {
            let shadow = false
            if (typeof this.playHead.shadow === 'boolean') shadow = this.playHead.shadow
            else if (this.playHead.shadow.length > 0) shadow = this.playHead.shadow[index]
            item.drawPlayHead(this.playHead.audio.currentTime, !item.playHead ? { color: this.playHead.color || '#fa0', width: this.playHead.width || 2, shadow: shadow } : null)
        })
        if (!timeupdate && (this.playHead.audio.currentTime < this.startTime || this.playHead.audio.currentTime >= this.endTime)) {
            const play = this.playHead.audio.currentTime >= this.playHead.audio.duration
            this.playHead.audio.currentTime = this.startTime
            if (play) this.playHead.audio.play()
        }
        if (!timeupdate) this.playHead.frame = requestAnimationFrame(() => this.timeUpdate())
    }
    /**
     * @param {Number} zoom
     */
    set zoom(zoom) {
        if (zoom < .1) zoom = .1
        else if (zoom > this.maxTime - this.minTime) zoom = this.maxTime - this.minTime
        this.values.zoom = zoom
        if (this.values.startTime + this.values.zoom >= this.maxTime) this.values.startTime = this.maxTime - zoom
        this.update()
    }
    get zoom() {
        return this.values.zoom
    }
    /**
     * @param {Number} startTime
     */
    set startTime(startTime) {
        if (startTime < this.minTime) startTime = this.minTime
        else if (startTime + this.values.zoom >= this.maxTime) startTime = this.maxTime - this.values.zoom
        this.values.startTime = startTime
        this.update()
    }
    get startTime() {
        return this.values.startTime
    }
    /**
     * @param {Number} endTime
     */
    set endTime(endTime) {
        this.zoom = endTime - this.values.startTime
    }
    get endTime() {
        return this.values.startTime + this.values.zoom
    }
    /**
     * @param {Boolean} snap
     */
    set snap(snap) {
        this.snap_bool = snap
        this.update()
    }
    get snap() {
        return this.snap_bool
    }
    /**
     * @param {Number} startTime 
     * @param {Number} endTime 
     * @returns 
     */
    setTime(startTime, endTime) {
        if (startTime >= endTime || startTime < this.minTime || endTime > this.maxTime) return
        this.values.startTime = startTime
        this.values.zoom = endTime - startTime
        this.update()
    }
    /**
     * Create a canvas
     * @param {'waveform'|'custom'} type
     * @param {{parentElement: HTMLElement, height: Number, zoom: Boolean, zoomColor: String, displayTime: Boolean, formatTime: Boolean, buffer: AudioBuffer, channels: Number|Number[], colors: String|String[], bufferOffset: Number, updateCallback: (self: CustomCanvas, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, startTime: Number, endTime: Number, completedCallback: Function), verticalSnap: Number, verticalPadding: Number}} properties
     * @param {{type: 'click'|'move'|'ctxclick'|'leave', listener: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, start = {x: Number, y: Number, y_percentage: Number, s: Number}, current = {x: Number, y: Number, y_percentage: Number, s: Number}, e: MouseEvent}[]} eventListeners
     * @return {WaveformCanvas|CustomCanvas}
     */
    createCanvas(type, properties, eventListeners) {
        const container = document.createElement('div'), parent = properties.parentElement || this.container
        container.style = 'display:flex;position:relative;background:#000;'
        container.innerHTML = '<canvas></canvas>'
        parent.appendChild(container)
        let _newCanvasObject
        switch (type) {
            case 'waveform':
                _newCanvasObject = new WaveformCanvas(this, container, { widthPercentage: this.values.width, height: properties.height || 100 }, { bool: properties.zoom !== undefined ? properties.zoom : true, color: properties.zoomColor || '#a00' }, { bool: properties.displayTime !== undefined ? properties.displayTime : true, format: properties.formatTime !== undefined ? properties.formatTime : false }, { buffer: properties.buffer || this.waveformBuffer, channels: properties.channels || 0, colors: properties.colors || '#fff', offset: properties.bufferOffset || 0 })
                break
            case 'custom':
                _newCanvasObject = new CustomCanvas(this, container, { widthPercentage: this.values.width, height: properties.height || 100 }, { bool: properties.zoom !== undefined ? properties.zoom : true, color: properties.zoomColor || '#a00' }, { bool: properties.displayTime !== undefined ? properties.displayTime : true, format: properties.formatTime !== undefined ? properties.formatTime : false }, properties.updateCallback, properties.verticalSnap || 0, properties.verticalPadding || 0)
                break
        }
        if (eventListeners) eventListeners.forEach(item => _newCanvasObject.addEventListener(item.type, item.listener))
        this.canvas_arr.push(_newCanvasObject)
        if (_newCanvasObject.constructor.name === 'WaveformCanvas') {
            if (-_newCanvasObject.offset < this.minTime) this.minTime = -_newCanvasObject.offset
            if (_newCanvasObject.buffer.duration - _newCanvasObject.offset > this.maxTime) this.maxTime = _newCanvasObject.buffer.duration - _newCanvasObject.offset
        }
        return _newCanvasObject
    }
}