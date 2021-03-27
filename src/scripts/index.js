const initApp = () => {
  new window.Splide('.splide', {
    type: 'loop',
    arrows: false,
    pagination: false,
    direction: 'ttb',
    autoHeight: true,
    heightRatio: 1
  }).mount()
}

document.addEventListener('DOMContentLoaded', () => {
  initApp()
})
