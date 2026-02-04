/*
Документація по роботі у шаблоні: 
Документація слайдера: https://swiperjs.com/
Сніппет(HTML): swiper
*/

// Підключаємо слайдер Swiper з node_modules
// При необхідності підключаємо додаткові модулі слайдера, вказуючи їх у {} через кому
// Приклад: { Navigation, Autoplay }
import Swiper from 'swiper';
import { Navigation, Parallax, Autoplay, Mousewheel } from 'swiper/modules';
/*
Основні модулі слайдера:
Navigation, Pagination, Autoplay, 
EffectFade, Lazy, Manipulation
Детальніше дивись https://swiperjs.com/
*/

// Стилі Swiper
// Підключення базових стилів
import './slider.scss';
// Повний набір стилів з node_modules
// import 'swiper/css';


// const resizableSwiper = (
//   breakpoint,
//   swiperClass,
//   swiperSettings,
//   callback,
//   options = {}
// ) => {
//   let swiper;
//   const mediaQuery = window.matchMedia(breakpoint);
//   const debug = options.debug ?? false;

//   const log = (...args) => {
//     if (debug) console.log(...args);
//   };

//   const enableSwiper = () => {
//     swiper = new Swiper(swiperClass, swiperSettings);
//     log('Swiper initialized');
//     if (typeof callback === 'function') callback(swiper);
//   };

//   const disableSwiper = () => {
//     if (swiper) {
//       swiper.destroy(true, true);
//       swiper = undefined;
//       log('Swiper destroyed');
//     }
//   };

//   const checkBreakpoint = () => {
//     if (mediaQuery.matches) {
//       if (!swiper) enableSwiper();
//     } else {
//       disableSwiper();
//     }
//   };

//   mediaQuery.addEventListener('change', checkBreakpoint);
//   checkBreakpoint();

//   // API для управления экземпляром
//   return {
//     destroy() {
//       disableSwiper();
//       mediaQuery.removeEventListener('change', checkBreakpoint);
//       log('Listener removed');
//     },
//     updateSettings(newSettings) {
//       if (swiper) {
//         log('Updating swiper settings...');
//         swiper.params = Object.assign(swiper.params, newSettings);
//         swiper.update();
//       }
//     },
//     get instance() {
//       return swiper;
//     },
//   };
// };

// Список слайдерів

if (document.querySelector('.features__slider')) {
  new Swiper('.features__slider', {
    modules: [Autoplay],
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 80,
    slidesPerView: 3,
    loop: true,
    speed: 900,
    autoplay: {
      delay: 2200,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    grabCursor: true,
  });
}

if (document.querySelector('.df__slider')) {
  new Swiper('.df__slider', {
    modules: [Autoplay],
    slidesPerView: 3,
    spaceBetween: 42,
    loop: true,
    speed: 900,
    autoplay: {
      delay: 2400,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    grabCursor: true,
    breakpoints: {
      0:   { slidesPerView: 1.05, spaceBetween: 18 },
      640: { slidesPerView: 2,    spaceBetween: 24 },
      980: { slidesPerView: 3,    spaceBetween: 42 },
    },
  });
}
