let audio = new Audio(), events = [{ time: 0, color: '#ffffff', automation: [{ time: 0, alpha: 0 }] }], audioBuffer = AudioBuffer.prototype, editor = WaveformEditor.prototype, zoomedWaveform = WaveformCanvas.prototype, eventsEditor = CustomCanvas.prototype, preview = AudioEvents.prototype, zoomSlider = Slider.prototype
audio.volume = .2

async function init_editor(audioFile, jsonEvents, bpm, timeSignature) {
    audio.src = audioFile
    events = jsonEvents
    audioBuffer = await fetch(audioFile).then(r => r.arrayBuffer().then(a => new AudioContext().decodeAudioData(a)))
    preview = new AudioEvents(audio, document.querySelector('#preview > canvas'), events, '--preview-border', '--preview-title')

    editor = new WaveformEditor(document.querySelector('#editor-container'), audioBuffer, .98, { bpm: bpm || 120, timeSignature: timeSignature || 4 }, { audio: audio, color: '#fa0', width: 4, shadow: false }, self => {
        zoomSlider.min = self.zoomProperties.min
        zoomSlider.max = self.zoomProperties.max
        zoomSlider.value = self.zoom
        zoomSlider.update()
        eventsEditor.mouseEvents.ctx.clearRect(0, 0, eventsEditor.WIDTH, eventsEditor.HEIGHT)
        preview.newEvents(events)
    })

    create_staticWaveform()
    create_controls()
    create_zoomedWaveform()
    create_eventsEditor()
    add_controlEventListeners()
    create_shortcuts()

    editor.update()
    document.body.className = 'editor'
}