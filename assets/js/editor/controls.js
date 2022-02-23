function create_controls() {
    const controls = document.createElement('div')
    controls.className = 'container controls'
    controls.innerHTML = '<div class="container row"><h3 style="transform:translateY(-2px)">Zoom:</h3><div id="editor-zoom"></div></div><div class="container row" id="audio-controls"><button id="download" style="margin-right:50px;color:#0af">Download JSON</button><button id="prev" style="color:#fff">Prev</button><button id="playback-toggle" style="min-width:76px">Play</button><button id="next" style="color:#fff">Next</button><h3>Volume:</h3><div id="volume"></div><h3>Playback Rate:</h3><div id="playback-rate"></div><h4 id="playback-rate-display">1.00</h4><label for="editor-snap">Snap:</label><input type="checkbox" id="editor-snap"></div>'
    editor.container.appendChild(controls)
}

function add_controlEventListeners() {
    zoomSlider = new Slider(document.querySelector('#editor-zoom'), 0, 1, 1, 1000)
    zoomSlider.addEventListener('change', value => editor.zoom = value)
    setTimeout(() => zoomSlider.setLength(getZoomWidth()), 500)
    let resizeTimeout = null
    addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => zoomSlider.setLength(getZoomWidth()), 500)
    })

    function getZoomWidth() {
        zoomSlider.container.style.display = 'none'
        zoomSlider.container.parentElement.style.width = 'auto'
        const value = innerWidth - zoomSlider.container.parentElement.getBoundingClientRect().width - 100
        zoomSlider.container.style.display = zoomSlider.container.parentElement.style.width = ''
        return value
    }

    document.querySelector('#playback-toggle').addEventListener('click', () => audio.paused ? audio.play() : audio.pause())
    audio.addEventListener('play', () => document.querySelector('#playback-toggle').innerHTML = 'Pause')
    audio.addEventListener('pause', () => document.querySelector('#playback-toggle').innerHTML = 'Play')

    const volumeSlider = new Slider(document.querySelector('#volume'), 0, 1, audio.volume, 150)
    volumeSlider.addEventListener('input', value => audio.volume = value)
    audio.addEventListener('volumechange', e => {
        volumeSlider.value = e.target.volume
        volumeSlider.update()
    })

    const playbackRateSlider = new Slider(document.querySelector('#playback-rate'), .25, 1, 1, 150)
    playbackRateSlider.addEventListener('input', value => document.querySelector('#playback-rate-display').innerHTML = value.toFixed(2))
    playbackRateSlider.addEventListener('change', value => audio.playbackRate = value)
    audio.addEventListener('ratechange', e => {
        playbackRateSlider.value = e.target.playbackRate
        playbackRateSlider.update()
        document.querySelector('#playback-rate-display').innerHTML = e.target.playbackRate.toFixed(2)
    })

    document.querySelector('#editor-snap').addEventListener('click', e => editor.snap = e.target.checked)

    document.querySelector('#prev').addEventListener('click', () => editor.startTime -= editor.zoom)
    document.querySelector('#next').addEventListener('click', () => editor.startTime += editor.zoom)

    document.querySelector('#download').addEventListener('click', () => {
        const a = document.createElement('a'), data = encodeURIComponent(JSON.stringify(events))
        a.setAttribute('href', 'data:application/json;charset=utf-8,' + data)
        a.setAttribute('download', 'events.json')
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    })
}