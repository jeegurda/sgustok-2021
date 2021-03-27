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
      loadPrevNext: true
    },
    init: false,
    pagination: {
      el: '.swiper-pagination',
      type: 'custom',
      renderCustom: (_, current, total) => {
        return `Lot${current}/${total}`
      }
    }
  })
}

const getHtml = ({ image, id, video, url }) => `
  ${url ? `<a href="${url}" target="_blank" rel="noreferrer noopener" tabindex="-1"` : '<div'} class="swiper-slide project" data-hash="${id}">
    ${image ? `<img class="swiper-lazy" data-src="${image}" />` : ''}
    ${video ? `<video class="swiper-lazy" data-src="${video}"></video>` : ''}
    <div class="project-action status-${url ? 'in-stock' : 'sold-out'}">
      <span class="in-stock">Buy</span>
      <span class="sold-out">Sold</span>
    </div>
  ${url ? '</a>' : '</div>'}   
`

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
    textContainerOuter.classList.add('text-in')
  }
  
  const hideText = () => {
    textContainerOuter.classList.remove('text-in')
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

const addMenuEvents = textApi => {
  let menuOpen = false
  let menuAboutOpen = false

  const menu = document.querySelector('.trigger-menu')
  const main = document.querySelector('main')

  const showMenu = () => {
    main.classList.add('menu-open')
  }

  const hideMenu = () => {
    main.classList.remove('menu-open')
  }

  const showMenuAbout = () => {
    main.classList.add('menu-about-open')
  }

  const hideMenuAbout = () => {
    main.classList.remove('menu-about-open')
  }

  menu.addEventListener('click', () => {
    if (menuOpen) {
      if (menuAboutOpen) {
        hideMenuAbout()
        menuAboutOpen = false
      } else {
        hideMenu()
        menuOpen = false
      }
    } else {
      showMenu()
      textApi.hideText()
      menuOpen = true
    }
  })

  const triggerMenuAbout = document.querySelector('.trigger-menu-about')

  const aboutDescription = document.querySelector('.about-description')
  const aboutNode = document.querySelector('.menu-about')

  aboutNode.innerHTML = aboutDescription.cloneNode(true).innerHTML

  triggerMenuAbout.addEventListener('click', () => {
    if (menuAboutOpen) {
      hideMenuAbout()
      menuAboutOpen = false
    } else {
      showMenuAbout()
      menuAboutOpen = true
    }
  })
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const content = await getJson()
    content.reverse()

    const slider = createSlider()
    const wrapper = document.querySelector('.swiper-wrapper')

    const textApi = addTriggerEvents(slider, content)
    
    content.forEach(item => {
      // Non-standard: Swiper has initialization problems while using "appendChild" method with current lazy settings
      // Working with an existing html works though
      wrapper.innerHTML += getHtml(item) 
    })
    
    slider.init()

    addMenuEvents(textApi)
  } catch (reason) {
    console.error('Failed to load content', reason)
  }
})
