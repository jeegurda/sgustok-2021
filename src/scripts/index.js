const getJson = async () => {
  const json = await fetch('../content/content.json')
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return Promise.reject(res)
    })
    .catch(reason => {
      console.error('Failed to get JSON', reason)
      return Promise.reject(reason)
    })

  return json
}

const createSlider = () => {
  return new window.Swiper('.swiper-container', {
    direction: 'vertical',
    loop: true,
    grabCursor: true,
    longSwipesRatio: 0.1,
    longSwipesMs: 100,
    mousewheel: {
      forceToAxis: true,
      thresholdDelta: 20,
      thresholdTime: 100
    },  
    hashNavigation: {
      replaceState: true,
      watchState: true
    },
    preloadImages: false,
    lazy: {
      checkInView: true,
      scrollingElement: '.swiper-container'
    },
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
    slidesPerView: 1,
    init: false
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const content = await getJson()

    console.log(content)
    const slider = createSlider()

    const slideTemplate = `
      <div class="swiper-slide swiper-lazy project" data-hash="%id" data-background="%src">

      </div>    
    `
    slider.init()

    content.forEach(item => {
      slider.appendSlide(
        slideTemplate
          .replace('%src', item.image)
          .replace('%id', item.id)
      )
    })
  } catch (reason) {
    console.error('Failed to load content', reason)
  }
})
