const tabs = document.querySelectorAll('[data-filter]');
const cards = document.querySelectorAll('[data-category]');
const empty = document.querySelector('#empty-posts');
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(item => { item.classList.toggle('active', item === tab); item.setAttribute('aria-pressed', String(item === tab)); });
  let visible = 0;
  cards.forEach(card => { card.hidden = tab !== tabs[0] && card.dataset.category !== tab.dataset.filter; if (!card.hidden) visible++; });
  if (empty) empty.hidden = visible !== 0;
}));
const links = document.querySelectorAll('nav a[href^="#"]');
if (links.length) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) links.forEach(link => { const active = link.hash === '#' + entry.target.id; link.classList.toggle('current', active); if(active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }), {rootMargin: '-15% 0px -65% 0px'});
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
}

const english = document.documentElement.lang === 'en';
const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
function updateTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle?.setAttribute('aria-label', english ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : `切换到${theme === 'dark' ? '明亮' : '暗色'}主题`);
  const label = document.querySelector('.theme-label');
  if (label) label.textContent = english ? (theme === 'dark' ? 'Dark' : 'Light') : (theme === 'dark' ? '暗色' : '明亮');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1c2230' : '#f7f8fc');
}
updateTheme(document.documentElement.dataset.theme);
themeToggle?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  savePreference('yixiu-theme', theme);
  updateTheme(theme);
});
systemTheme.addEventListener('change', event => {
  let saved;
  try { saved = localStorage.getItem('yixiu-theme'); } catch {}
  if (!['light','dark'].includes(saved)) updateTheme(event.matches ? 'dark' : 'light');
});
const languageToggle = document.querySelector('.language-toggle');
languageToggle?.addEventListener('click', () => {
  savePreference('yixiu-language', english ? 'zh' : 'en');
  const target = new URL(languageToggle.href);
  target.search = location.search;
  target.hash = location.hash;
  languageToggle.href = target.href;
});
