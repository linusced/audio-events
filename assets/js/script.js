addEventListener('load', () => {
    document.querySelector('#files').addEventListener('submit', async e => {
        e.preventDefault()
        if (e.target.audio.disabled) return
        try {
            const audio = e.target.audio.files[0], json = e.target.json.files[0]
            if (!audio) throw 'Audio file required!'
            else if (!/^audio\/.+$/.test(audio.type)) throw { element: 'audio', msg: 'Invalid audio file!' }
            let newJson = null
            if (!json) newJson = []
            else if (!/^application\/json$/.test(json.type)) throw { element: 'json', msg: 'Invalid json file!' }

            const audioDataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.addEventListener('load', e => resolve(e.target.result))
                reader.addEventListener('error', e => reject(e.target.error))
                reader.readAsDataURL(audio)
            }).catch(reject => { throw { element: 'audio', msg: reject } }),
                jsonEvents = newJson || JSON.parse(await new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.addEventListener('load', e => resolve(e.target.result))
                    reader.addEventListener('error', e => reject(e.target.error))
                    reader.readAsText(json)
                }).catch(reject => { throw { element: 'json', msg: reject } }))

            msg('form', 'Initializing editor...')
            init_editor(audioDataURL, jsonEvents, parseInt(e.target.bpm.value), parseInt(e.target.timeSignature.value))
        } catch (err) {
            msg(err.element, err.msg)
        }
    })
    function msg(element, msg) {
        forEach(document.querySelector('#files'), '.form-group input', input => {
            if (input.name === element) input.setAttribute('data-validation', msg)
            else input.setAttribute('data-validation', '')
        })
        if (element === 'form') {
            document.querySelector('#files .form-msg').innerHTML = msg
            forEach(document.querySelector('#files'), 'input', input => input.disabled = true)
        }
        formUpdate()
    }
})