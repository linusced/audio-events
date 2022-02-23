function create_shortcuts() {
    const keydownData = { type: '', value: '', progress: 0 }
    addEventListener('keydown', e => {
        if (e.target.tagName !== 'INPUT') {
            if (e.code === 'Space' || e.code === 'KeyK') {
                document.querySelector('#playback-toggle').click()
                e.preventDefault()
            } else if (e.code === 'KeyJ') document.querySelector('#prev').click()
            else if (e.code === 'KeyL') document.querySelector('#next').click()
            else if (e.code === 'KeyM') audio.volume = audio.volume > 0 ? 0 : .2
            else if (e.code === 'ArrowUp') {
                e.preventDefault()
                var value = audio.volume + .1
                audio.volume = value > 1 ? 1 : value
            } else if (e.code === 'ArrowDown') {
                e.preventDefault()
                var value = audio.volume - .1
                audio.volume = value < 0 ? 0 : value
            } else if (e.code === 'NumpadAdd') editor.zoom -= 5
            else if (e.code === 'NumpadSubtract') editor.zoom += 5
            else if (e.code === 'KeyS') document.querySelector('#editor-snap').click()
            else if (e.code === 'KeyD') document.querySelector('#download').click()
            else if (e.code === 'KeyZ' && e.shiftKey === true) redo()
            else if (e.code === 'KeyZ') undo()
            else if (!document.querySelector('#selected-event').classList.contains('hidden')) {

                if (keydownData.type === 'copy') {
                    if (eventFunctions.copy) {
                        const exec = /(\d)/.exec(e.code)
                        if (exec) keydownData.value += exec[0]
                        else if (e.code === 'NumpadDecimal' || e.code === 'Period' || e.code === 'Comma') keydownData.value += '.'
                        else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                            document.querySelector('#event-copy-position').value = keydownData.value
                            document.querySelector('#event-copy-confirm').click()
                            keydownData.type = keydownData.value = ''
                        }
                    } else keydownData.type = keydownData.value = ''

                } else if (keydownData.type === 'loop') {
                    if (eventFunctions.loop) {
                        const exec = /(\d)/.exec(e.code)
                        if (exec) keydownData.value += exec[0]
                        else if (e.code === 'NumpadDecimal' || e.code === 'Period' || e.code === 'Comma') keydownData.value = ''
                        else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                            document.querySelector('#event-loop-amount').value = keydownData.value
                            document.querySelector('#event-loop-confirm').click()
                            keydownData.type = keydownData.value = ''
                        }
                    } else keydownData.type = keydownData.value = ''

                } else if (keydownData.type === 'beats') {
                    if (eventFunctions.beats) {
                        const exec = /(\d)/.exec(e.code)
                        if (exec) keydownData.value += exec[0]
                        else if (e.code === 'NumpadDecimal' || e.code === 'Period' || e.code === 'Comma') keydownData.value += '.'
                        else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                            if (keydownData.progress === 0) {
                                document.querySelector('#event-beats-value').value = keydownData.value
                                keydownData.value = ''
                                keydownData.progress++
                            } else if (keydownData.progress === 1) {
                                document.querySelector('#event-beats-minAlpha').value = keydownData.value
                                keydownData.value = ''
                                keydownData.progress++
                            } else if (keydownData.progress === 2) {
                                document.querySelector('#event-beats-maxAlpha').value = keydownData.value
                                document.querySelector('#event-beats-confirm').click()
                                keydownData.type = keydownData.value = ''
                                keydownData.progress = 0
                            }
                        }
                    } else {
                        keydownData.type = keydownData.value = ''
                        keydownData.progress = 0
                    }

                } else if (e.code === 'KeyC') {
                    document.querySelector('#event-copy').click()
                    keydownData.type = 'copy'
                } else if (e.code === 'KeyX') {
                    document.querySelector('#event-loop').click()
                    keydownData.type = 'loop'
                } else if (e.code === 'KeyB') {
                    document.querySelector('#event-beats').click()
                    keydownData.type = 'beats'
                    document.querySelector('#event-beats-type').value = 'amount'
                } else if (e.code === 'Delete') document.querySelector('[name="delete"]').click()
            }
        }
    })
}