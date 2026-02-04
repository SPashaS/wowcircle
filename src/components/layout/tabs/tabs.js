import {
  FLS,
  slideUp,
  slideDown,
  slideToggle,
  dataMediaQueries,
  getHash,
  setHash,
} from '@js/common/functions.js';

// Підключення базових стилів
import './tabs.scss';

export function tabs() {
  const tabs = document.querySelectorAll('[data-fls-tabs]');
  let tabsActiveHash = [];

  if (tabs.length > 0) {
    const hash = getHash();

    FLS(`_FLS_TABS_START`, tabs.length);

    if (hash && hash.startsWith('tab-')) {
      tabsActiveHash = hash.replace('tab-', '').split('-');
    }
    tabs.forEach((tabsBlock, index) => {
      tabsBlock.classList.add('--tab-init');
      tabsBlock.setAttribute('data-fls-tabs-index', index);
      tabsBlock.addEventListener('click', setTabsAction);
      initTabs(tabsBlock);
    });

    // Отримання слойлерів з медіа-запитами
    let mdQueriesArray = dataMediaQueries(tabs, 'flsTabs');
    if (mdQueriesArray && mdQueriesArray.length) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        // Подія
        mdQueriesItem.matchMedia.addEventListener('change', function () {
          setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
        });
        setTitlePosition(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
  }
  // Встановлення позицій заголовків
  function setTitlePosition(tabsMediaArray, matchMedia) {
    tabsMediaArray.forEach((tabsMediaItem) => {
      tabsMediaItem = tabsMediaItem.item;
      let tabsTitles = tabsMediaItem.querySelector('[data-fls-tabs-titles]');
      let tabsTitleItems = tabsMediaItem.querySelectorAll(
        '[data-fls-tabs-title]'
      );
      let tabsContent = tabsMediaItem.querySelector('[data-fls-tabs-body]');
      let tabsContentItems = tabsMediaItem.querySelectorAll(
        '[data-fls-tabs-item]'
      );
      tabsTitleItems = Array.from(tabsTitleItems).filter(
        (item) => item.closest('[data-fls-tabs]') === tabsMediaItem
      );
      tabsContentItems = Array.from(tabsContentItems).filter(
        (item) => item.closest('[data-fls-tabs]') === tabsMediaItem
      );
      tabsContentItems.forEach((tabsContentItem, index) => {
        if (matchMedia.matches) {
          tabsContent.append(tabsTitleItems[index]);
          tabsContent.append(tabsContentItem);
          tabsMediaItem.classList.add('--tab-spoller');
        } else {
          tabsTitles.append(tabsTitleItems[index]);
          tabsMediaItem.classList.remove('--tab-spoller');
        }
      });
    });
  }
  // Робота з контентом
  function initTabs(tabsBlock) {
    const allTitles = Array.from(tabsBlock.querySelectorAll('[data-fls-tabs-titles]>*'));
    // помечаем ВСЕ заголовки, а не по индексу контейнеров
    allTitles.forEach((el) => el.setAttribute('data-fls-tabs-title', ''));
  
    const tabsContent = tabsBlock.querySelectorAll('[data-fls-tabs-body]>*');
    const tabsBlockIndex = tabsBlock.dataset.flsTabsIndex;
    const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;
  
    if (tabsActiveHashBlock) {
      tabsBlock.querySelector('[data-fls-tabs-titles]>.--tab-active')?.classList.remove('--tab-active');
    }
  
    // один .tabs__body всё равно помечаем
    tabsContent.forEach((tabsContentItem) => {
      tabsContentItem.setAttribute('data-fls-tabs-item', '');
    });
  
    // если ничего не активно — активируем первую (обычно All)
    const anyActive = allTitles.some((el) => el.classList.contains('--tab-active'));
    if (!anyActive && allTitles.length > 0) {
      allTitles[0].classList.add('--tab-active');
    }
  
    setTabsStatus(tabsBlock);
  }
  
  
  function setTabsStatus(tabsBlock) {
    const allTitles  = Array.from(tabsBlock.querySelectorAll('[data-fls-tabs-title]'));
    const activeTitle = tabsBlock.querySelector('[data-fls-tabs-title].--tab-active');
    const isAllActive = activeTitle?.hasAttribute('data-tab-all');
    const isHash      = tabsBlock.hasAttribute('data-fls-tabs-hash');
  
    const items = Array.from(tabsBlock.querySelectorAll('[data-fls-tabs-item] .tabs-item[data-tab-cats], .tabs-item[data-tab-cats]'));
    const animateMs = tabsBlock.hasAttribute('data-fls-tabs-animate')
      ? (Number(tabsBlock.dataset.flsTabsAnimate) || 500)
      : 0;
  
    const activeCat = isAllActive ? null : (activeTitle?.dataset.tabCat || '').trim().toLowerCase();
  
    if (animateMs) tabsBlock.classList.add('--tabs-animating');
  
    items.forEach((item) => {
      const cats = (item.dataset.tabCats || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
  
      const show = isAllActive || (activeCat && cats.includes(activeCat));
  
      if (show) {
        if (animateMs) slideDown(item, animateMs); else item.hidden = false;
        item.dispatchEvent(new CustomEvent('showmoreUpdate', { bubbles: true }));
      } else {
        if (animateMs) slideUp(item, animateMs); else item.hidden = true;
      }
    });
  
    if (isHash && !isAllActive && !tabsBlock.closest('.popup')) {
      const titlesNoAll = allTitles.filter((t) => !t.hasAttribute('data-tab-all'));
      const idx = titlesNoAll.indexOf(activeTitle);
      const blockIndex = tabsBlock.dataset.flsTabsIndex;
      if (idx >= 0) setHash(`tab-${blockIndex}-${idx}`);
    }
  
    if (animateMs) {
      setTimeout(() => tabsBlock.classList.remove('--tabs-animating'), animateMs + 30);
    }
  }
  
  
  
  function setTabsAction(e) {
    const el = e.target;
    if (!el.closest('[data-fls-tabs-title]')) return;
  
    const tabTitle  = el.closest('[data-fls-tabs-title]');
    const tabsBlock = tabTitle.closest('[data-fls-tabs]');
  
    // не переключаем ту же самую
    if (tabTitle.classList.contains('--tab-active')) {
      e.preventDefault();
      return;
    }
  
    // блокируем только на время нашей анимации, а не из-за внутренних .--slide
    if (tabsBlock.classList.contains('--tabs-animating')) {
      e.preventDefault();
      return;
    }
  
    Array.from(tabsBlock.querySelectorAll('[data-fls-tabs-title].--tab-active'))
      .forEach((btn) => btn.classList.remove('--tab-active'));
  
    tabTitle.classList.add('--tab-active');
  
    setTabsStatus(tabsBlock);
    e.preventDefault();
  }
  
  

  function tabsExtra() {
    const blocks = document.querySelectorAll('[data-fls-tabs]');
    if (!blocks.length) return;
  
    blocks.forEach((tabsBlock) => {
      const allTab = tabsBlock.querySelector('[data-tab-all]');
      if (!allTab) return;
  
      // уверены, что у All есть атрибут заголовка
      allTab.setAttribute('data-fls-tabs-title', '');
  
      allTab.addEventListener('click', (e) => {
        e.preventDefault();
        tabsBlock.querySelectorAll('[data-fls-tabs-title]').forEach((b) => b.classList.remove('--tab-active'));
        allTab.classList.add('--tab-active');
  
        // показать все карточки
        tabsBlock.querySelectorAll('.tabs-item[data-tab-cats]').forEach((it) => {
          it.hidden = false;
          it.dispatchEvent(new CustomEvent('showmoreUpdate', { bubbles: true }));
        });
  
        if (tabsBlock.hasAttribute('data-fls-tabs-hash')) {
          history.replaceState(null, '', ' ');
        }
      });
  
      // если All активен по умолчанию — раскрой всё
      if (allTab.classList.contains('--tab-active')) {
        tabsBlock.querySelectorAll('.tabs-item[data-tab-cats]').forEach((it) => {
          it.hidden = false;
          it.dispatchEvent(new CustomEvent('showmoreUpdate', { bubbles: true }));
        });
      }
    });
  }
  
  
  

  // 👇 Запускаем доп. вкладку
  tabsExtra();
}
window.addEventListener('load', tabs);
