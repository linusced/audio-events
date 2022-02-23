class WaveformCanvas extends EditorCanvas {
    constructor(timeWrapper = WaveformEditor.prototype || { startTime: 0, endTime: 0 }, container = HTMLElement.prototype, size = { widthPercentage: 0, height: 0, verticalPadding: 0 }, zoom = { bool: true, color: '' }, time = { bool: true, format: false }, waveform = { buffer: AudioBuffer.prototype, channels: 1 || [0], colors: '#' || [''], offset: 0 }) {
        super(timeWrapper, container, size, zoom, time)
        this.offset = waveform.offset
        if (this.offset > 0) {
            const _newBuffer = (this.wrapper.ctx || new AudioContext()).createBuffer(waveform.buffer.numberOfChannels, waveform.buffer.length + this.offset * waveform.buffer.sampleRate, waveform.buffer.sampleRate),
                offsetArray = new Float32Array(this.offset * waveform.buffer.sampleRate).fill(0)
            for (let c = 0; c < _newBuffer.numberOfChannels; c++) {
                _newBuffer.copyToChannel(offsetArray, c)
                _newBuffer.copyToChannel(waveform.buffer.getChannelData(c), c, offsetArray.length)
            }
            this.buffer = _newBuffer
        } else this.buffer = waveform.buffer
        this.channels = typeof waveform.channels === 'number' ? [waveform.channels] : waveform.channels
        this.colors = typeof waveform.colors === 'string' ? new Array(this.channels.length).fill(waveform.colors) : waveform.colors
    }
    update() {
        super.update((startTime, endTime) => new Promise(resolve => {
            const sampleRate = this.buffer.sampleRate
            for (let c = 0; c < this.channels.length; c++) {
                let array = this.buffer.getChannelData(c), localStartTime = startTime
                if (startTime < 0) {
                    var _newArray = new Float32Array((-startTime * this.buffer.sampleRate) + array.length), offsetArray = new Float32Array(-startTime * this.buffer.sampleRate).fill(0)
                    _newArray.set(offsetArray)
                    _newArray.set(array, offsetArray.length)
                    array = _newArray
                    localStartTime = 0
                }
                if (endTime > array.length / this.buffer.sampleRate) {
                    var _newArray = new Float32Array(endTime * this.buffer.sampleRate + array.length), offsetArray = new Float32Array(endTime * this.buffer.sampleRate - array.length).fill(0)
                    _newArray.set(array)
                    _newArray.set(offsetArray, array.length)
                    array = _newArray
                }
                if (localStartTime > 0 || endTime < array.length / this.buffer.sampleRate) array = array.slice(Math.floor(localStartTime * sampleRate), Math.ceil(endTime * sampleRate))

                const channelHeight = this.HEIGHT / this.channels.length, channelOffset = c * channelHeight, x = Math.round(array.length / this.WIDTH), y = channelHeight / 2
                this.ctx.fillStyle = this.colors[c]
                for (let i = 0; i < this.WIDTH; i++) {
                    let min = 1, max = -1
                    for (let j = 0; j < x; j++) {
                        const value = array[(i * x) + j]
                        if (value < min) min = value
                        if (value > max) max = value
                    }
                    this.ctx.fillRect(i, (1 + min) * y + channelOffset, 1, Math.max(1, (max - min) * y))
                }
            }
            resolve()
        }))
    }
}
class CustomCanvas extends EditorCanvas {
    constructor(timeWrapper = WaveformEditor.prototype || { startTime: 0, endTime: 0 }, container = HTMLElement.prototype, size = { widthPercentage: 0, height: 0, verticalPadding: 0 }, zoom = { bool: true, color: '' }, time = { bool: true, format: false }, updateCallback = (self, canvas, ctx, startTime, endTime, completedCallback) => completedCallback(), verticalSnap = 0, verticalPadding = 0) {
        super(timeWrapper, container, size, zoom, time)
        this.callback = updateCallback
        this.verticalSnap = verticalSnap
        this.verticalPadding = verticalPadding
        const canvas = document.createElement('canvas')
        canvas.height = size.height
        canvas.width = this.widthMult * innerWidth
        canvas.style = 'position:absolute;top:0;left:0;z-index:1'
        this.container.appendChild(canvas)
        this.custom = { canvas: canvas, ctx: canvas.getContext('2d') }
    }
    update() {
        super.update((startTime, endTime) => new Promise(resolve => {
            this.custom.canvas.width = innerWidth * this.widthMult
            this.callback(this, this.canvas, this.ctx, startTime, endTime, () => resolve())
        }))
    }
}