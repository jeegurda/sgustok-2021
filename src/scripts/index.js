import addMenuEvents from './menu'
import getJson from './content'
import getMediaReady from './ready'

(() => {
  const createSlider = initialSlide => {
    return new window.Swiper('.swiper-container', {
      direction: 'vertical',
      loop: true,
      loopAdditionalSlides: 10,
      grabCursor: true,
      slidesPerView: 1,
      longSwipesRatio: 0.1,
      longSwipesMs: 50,
      mousewheel: {
        forceToAxis: true,
        thresholdDelta: 20,
        thresholdTime: 50
      },  
      hashNavigation: {
        replaceState: true,
        watchState: true
      },
      lazy: {
        loadPrevNextAmount: 1,
        loadPrevNext: true
      },
      init: false,
      pagination: {
        el: '.swiper-pagination',
        type: 'custom',
        renderCustom: (_, current, total) => {
          if (total <= 1) {
            return null
          }
          return `Lot${current}/${total}`
        }
      },
      initialSlide // Has to be set manually due to a lazy loading + hash nav combo bug
    })
  }

  const getHtml = ({ image, id, video, url, status, background }) => {
    let media = ''
    let action = ''
    let style = ''

    if (video) {
      media += `<video preload="metadata" playsinline autoplay loop muted class="swiper-lazy" data-src="${video}"></video>`
    } else if (image) {
      media += `<img class="swiper-lazy" data-src="${image}" />`
    }

    if (status === 'SOLD' || status === 'AVAILABLE') {
      action += `
        <div class="project-action status-${status === 'AVAILABLE' ? 'in-stock' : 'sold-out'}">
          <span class="in-stock">Buy</span>
          <span class="sold-out">Sold</span>
        </div>
      ` 
    }

    if (background) {
      style = `style="background-color: ${background}"`
    }

    return `
      ${url ? `<a href="${url}" target="_blank" rel="noreferrer noopener" tabindex="-1"` : '<div'} class="swiper-slide project" data-hash="${id}"${style}>
        ${media}
        ${action}
      ${url ? '</a>' : '</div>'}   
    `
  }

  const addTriggerEvents = (slider, content) => {
    const triggerAbout = document.querySelector('.trigger-about')
    const aboutDescription = document.querySelector('.about-description')

    const triggerInfo = document.querySelector('.trigger-info')
    const textContainer = document.querySelector('.text-container')
    const textContainerOuter = document.querySelector('.text')

    let currentTextId = null
    const currentSlide = () => slider.realIndex

    const getText = id => {
      let html = ''

      if (id === '%about') {
        html += aboutDescription.cloneNode(true).innerHTML
      } else {
        if (content[id].title) {
          html += `<p class="text-title">${content[id].title}</p>`
        }
        if (content[id].description) {
          html += `<p class="text-description">${content[id].description}</p>`
        }
      }

      return html
    }

    const showText = id => {
      textContainer.innerHTML = getText(id)
      textContainerOuter.classList.remove('text-out')
      textContainerOuter.classList.add('text-in')
    }
    
    const hideText = () => {
      textContainerOuter.classList.remove('text-in')
      textContainerOuter.classList.add('text-out')
      setTimeout(() => {
        textContainer.innerHTML = ''
      }, 200)
    }

    const identical = (currentTextId, id) => {
      if (id in content && currentTextId in content) {
        return (
          content[id].title === content[currentTextId].title && 
          content[id].description === content[currentTextId].description
        )
      } else {
        return false
      }    
    }

    const activateText = (id, auto = false) => {
      if (!auto && (currentTextId === id || identical(currentTextId, id))) {
        hideText()
        currentTextId = null
      } else if (!identical(currentTextId, id)) {
        if (currentTextId !== null) {
          hideText()

          setTimeout(() => {
            showText(id)
          }, 200)
        } else {
          showText(id)
        }

        currentTextId = id
      }
    }

    triggerAbout.addEventListener('click', () => activateText('%about'))
    triggerInfo.addEventListener('click', () => activateText(currentSlide()))
    slider.on('slideChange', () => {
      if (currentTextId !== null && currentTextId !== currentSlide()) { // Change only, don't open (TEMP: and don't close) description by just scrolling
        activateText(currentSlide(), true)
      }
    })

    return { showText, hideText }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const content = await getJson()
      content.reverse()

      const initialSlide = (() => {
        const hash = location.hash.slice(1)
        const matchingIdx = content.findIndex(i => i.id === hash)

        if (matchingIdx > -1) {
          return matchingIdx
        }
        return 0
      })()

      const slider = createSlider(initialSlide)
      const wrapper = document.querySelector('.swiper-wrapper')

      const textApi = addTriggerEvents(slider, content)
      
      content.forEach(item => {
        // Non-standard: Swiper has initialization problems while using "appendChild" method with current lazy settings
        // Working with an existing html works though
        wrapper.innerHTML += getHtml(item) 
      })

      const mediaReady = getMediaReady(slider, content)
      
      slider.init()

      addMenuEvents(textApi)

      await mediaReady

      const main = document.querySelector('main')
      const logoIcon = document.querySelector('.logo-icon')

      main.classList.add('loaded')      
      logoIcon.addEventListener('animationiteration', () => {
        logoIcon.classList.add('loaded')
      })
    } catch (reason) {
      console.error('Failed to load content', reason)
    }
  })
})()
