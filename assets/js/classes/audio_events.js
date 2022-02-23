class AudioEvents {
    constructor(audio = new Audio(), canvas = document.querySelector('canvas'), events = [{ time: 0, color: '#fff', automation: [{ time: 0, alpha: 0 }] }], colorAttribute = '', fullColorAttribute = '') {
        this.audio = audio
        this.canvas = canvas
        this.events = [...events]
        this.colorAttribute = colorAttribute
        this.fullColorAttribute = fullColorAttribute
        this.ctx = this.canvas.getContext('2d')
        this.currentIndex = this.previousTime = 0
        this.paused = this.audio.paused
        this.timeChange = this.resetIndex = this.actionBool = false
        this.audio.addEventListener('play', () => this.paused = this.timeChange = false)
        this.audio.addEventListener('pause', () => {
            this.paused = true
            if (!this.timeChange) this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        })
        document.addEventListener('visibilitychange', () => !document.hidden ? this.resetIndex = true : this.paused = true)
        this.animationFrame = requestAnimationFrame(() => this.update())
    }
    async update() {
        if (this.audio.playbackRate !== 1) this.resetIndex = true
        else if (Math.abs(this.audio.currentTime - this.previousTime) >= .2 || this.resetIndex) {
            this.timeChange = true
            this.paused = this.resetIndex = false
            for (var i = 0; i < this.events.length; i++) if (this.events[i].time > this.audio.currentTime) break
            this.currentIndex = i
        } else if (!this.paused && this.events[this.currentIndex] && this.audio.currentTime >= this.events[this.currentIndex].time) {
            this.actionBool = true
            this.resetIndex = await this.action()
            this.actionBool = false
            this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
            this.currentIndex++
        }
        this.previousTime = this.audio.currentTime
        this.animationFrame = requestAnimationFrame(() => this.update())
    }
    action() {
        return new Promise(resolve => {
            const event = this.events[this.currentIndex], automation = event.automation, startTime = Date.now(), { ctx, WIDTH, HEIGHT, colorAttribute, fullColorAttribute, audio } = this, gradient = ctx.createLinearGradient(0, 0, WIDTH, 0)
            let index = 0, previousAlpha = 0, nextAlpha = automation[0].alpha, previousTime = startTime, nextTime = startTime + (automation[0].time * 1000 - event.time * 1000), alphaPerMs = nextAlpha / (nextTime - previousTime), prevAudioTime = audio.currentTime, end = false, resolveParam = false
            gradient.addColorStop(0, event.color)
            gradient.addColorStop(.15, 'transparent')
            gradient.addColorStop(.85, 'transparent')
            gradient.addColorStop(1, event.color)
            ctx.fillStyle = gradient
            ctx.globalAlpha = 0
            document.addEventListener('visibilitychange', () => this.actionBool ? end = true : null)
            this.audio.addEventListener('pause', () => this.actionBool ? end = this.resetIndex = true : null)
            this.audio.addEventListener('loadedmetadata', () => this.actionBool ? end = true : null)
            document.documentElement.style.setProperty(fullColorAttribute, event.color)
            requestAnimationFrame(() => update())
            function update() {
                let alpha = previousAlpha + (alphaPerMs * (Date.now() - previousTime))
                if (alpha > 1) alpha = 1
                else if (alpha < 0) alpha = 0
                let alphaHex = Math.floor(alpha * 255).toString(16)
                if (alphaHex.length === 1) alphaHex = '0' + alphaHex
                ctx.globalAlpha = alpha
                ctx.clearRect(0, 0, WIDTH, HEIGHT)
                ctx.fillRect(0, 0, WIDTH, HEIGHT)
                document.documentElement.style.setProperty(colorAttribute, event.color + alphaHex)
                if (Date.now() >= nextTime) {
                    index++
                    if (!automation[index]) end = true
                    else {
                        previousAlpha = nextAlpha
                        nextAlpha = automation[index].alpha
                        previousTime = nextTime
                        nextTime = startTime + (automation[index].time * 1000 - event.time * 1000)
                        alphaPerMs = (nextAlpha - previousAlpha) / (nextTime - previousTime)
                    }
                }
                if (Math.abs(audio.currentTime - prevAudioTime) >= .2) end = resolveParam = true
                else prevAudioTime = audio.currentTime
                if (end) {
                    document.documentElement.style.removeProperty(colorAttribute)
                    document.documentElement.style.removeProperty(fullColorAttribute)
                    return resolve(resolveParam)
                } else requestAnimationFrame(() => update())
            }
        })
    }
    get WIDTH() {
        return this.canvas.width
    }
    get HEIGHT() {
        return this.canvas.height
    }
    newEvents(events) {
        this.events = [...events]
        this.resetIndex = true
    }
}