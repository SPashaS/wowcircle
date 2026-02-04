// Підключення функціоналу "Чортоги Фрілансера"
import { bodyLockStatus, bodyLockToggle, FLS } from '@js/common/functions.js';

import './menu.scss';

// export function menuInit() {
// 	document.addEventListener("click", function (e) {
// 		if (bodyLockStatus && e.target.closest('[data-fls-menu]')) {
// 			bodyLockToggle()
// 			document.documentElement.toggleAttribute("data-fls-menu-open")
// 		}
// 	});
// }

export function menuInit() {
  document.addEventListener('click', function (e) {
    const menuButton = e.target.closest('[data-fls-menu]');
    const menuItemLink = e.target.closest('.menu-item a');
    const menuBody = e.target.closest('.menu__body');
    const header = e.target.closest('header');

    // Открытие/закрытие по кнопке
    if (bodyLockStatus && menuButton) {
      bodyLockToggle();
      document.documentElement.toggleAttribute('data-fls-menu-open');
      return;
    }

    // Закрытие при клике на пункт меню
    if (
      document.documentElement.hasAttribute('data-fls-menu-open') &&
      menuItemLink
    ) {
      bodyLockToggle();
      document.documentElement.removeAttribute('data-fls-menu-open');
      return;
    }

    // Закрытие при клике вне меню и вне хедера
    if (
      document.documentElement.hasAttribute('data-fls-menu-open') &&
      !menuBody &&
      !header
    ) {
      bodyLockToggle();
      document.documentElement.removeAttribute('data-fls-menu-open');
    }
  });
}

document.querySelector('[data-fls-menu]')
  ? window.addEventListener('load', menuInit)
  : null;
