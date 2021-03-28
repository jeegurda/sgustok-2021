const addLoadEvents = (slider, content) => new Promise(resolve => {
  const loadedMedia = new Set()

  console.log(slider)

  const handle = (frame, media) => {
    const id = frame.getAttribute('data-hash')
    loadedMedia.add(id)

    if (loadedMedia.size >= Math.min(content.length, 3)) {
      resolve()
    }

    frame.addEventListener('animationiteration', () => {
      frame.classList.remove('media-loading')
    })
    media.classList.add('media-loaded')
  }

  slider.on('lazyImageLoad', (_, frame, media) => {
    frame.classList.add('media-loading')
    media.addEventListener('load', () => handle(frame, media))
    media.addEventListener('canplaythrough', () => handle(frame, media))
  })
})

const mediaReady = (slider, content) => {
  return Promise.all([
    new Promise(resolve => setTimeout(resolve, 300)), // Add min 300ms non-blocking delay for initial animations to complete
    Promise.race([
      addLoadEvents(slider, content),
      new Promise(resolve => setTimeout(resolve, 10000)) // Limit loading time by 10 sec
    ])
  ])
}

export default mediaReady
