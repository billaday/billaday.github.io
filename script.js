'use strict';
const isEnglish = document.documentElement.lang === 'en';
const language = isEnglish ? 'en' : 'zh';
const preferenceKey = 'liao-homepage-language';
const labels = isEnglish ? {
  menu: 'Menu', close: 'Close', copy: 'Copy email', copied: 'Copied',
  copySuccess: 'Email address copied to the clipboard.',
  copyFallback: 'Email address selected. Use your device’s copy command.'
} : {
  menu: '菜单', close: '收起', copy: '复制邮箱', copied: '已复制',
  copySuccess: '邮箱已复制到剪贴板。',
  copyFallback: '已选中邮箱，可长按或使用系统复制操作。'
};
const requestedLanguage = new URLSearchParams(location.search).get('lang');
let savedLanguage;
try { savedLanguage = localStorage.getItem(preferenceKey); } catch { /* Storage is optional. */ }
if (!isEnglish && requestedLanguage !== 'zh' &&
    (requestedLanguage === 'en' || savedLanguage === 'en')) {
  location.replace('/en/' + location.hash);
} else {
  try { localStorage.setItem(preferenceKey, language); } catch { /* Links still work without storage. */ }
}
document.querySelectorAll('[data-language]').forEach(link => {
  function updateDestination() {
    const nextLanguage = link.dataset.language;
    const target = new URL(nextLanguage === 'en' ? '/en/' : '/?lang=zh', location.origin);
    target.hash = location.hash;
    link.href = target.href;
  }
  updateDestination();
  window.addEventListener('hashchange', updateDestination);
  link.addEventListener('click', () => {
    try { localStorage.setItem(preferenceKey, link.dataset.language); } catch { /* Optional preference. */ }
  });
});
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = labels.menu;
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', expanded);
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.textContent = expanded ? labels.close : labels.menu;
});
navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-20% 0px -55% 0px', threshold: 0 });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
const copyButton = document.querySelector('.copy-button');
const copyStatus = document.querySelector('.copy-status');
let copyReset;
copyButton.addEventListener('click', async () => {
  clearTimeout(copyReset);
  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText('billaday@sjtu.edu.cn');
    copyButton.textContent = labels.copied;
    copyStatus.textContent = labels.copySuccess;
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email-link'));
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = labels.copyFallback;
  }
  copyReset = setTimeout(() => {
    copyButton.textContent = labels.copy;
    copyStatus.textContent = '';
  }, 6000);
});
