const addMenuEvents = (textApi) => {
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

export default addMenuEvents
