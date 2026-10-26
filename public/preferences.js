// Runs before styles load to apply the theme without a light-mode flash.
(() => {
  let language, theme;
  try { language = localStorage.getItem('yixiu-language'); theme = localStorage.getItem('yixiu-theme'); } catch {}
  const english = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const root = location.pathname === '/' || location.pathname === '/index.html';
  const preferred = ['zh', 'en'].includes(language) ? language : navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  if (root && preferred === 'en') location.replace('/en/' + location.search + location.hash);
  document.documentElement.dataset.theme = ['light','dark'].includes(theme) ? theme : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.lang = english ? 'en' : 'zh-CN';
})();
