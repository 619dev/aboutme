import { translate } from './i18n.mjs';
import { readdir, readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline = s => escape(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
function markdown(source) {
  let code = false, list = false, out = '';
  for (const line of source.trim().split('\n')) {
    if (line.startsWith('```')) { if (list) {out += '</ul>'; list = false;} out += code ? '</code></pre>' : '<pre><code>'; code = !code; continue; }
    if(code) {out += escape(line) + '\n'; continue;}
    const item = line.match(/^- (.+)$/);
    if (list && !item) { out += '</ul>'; list = false; }
    if (item) {if (!list) out += '<ul>'; list = true; out += `<li>${inline(item[1])}</li>`;}
    else if (/^#{1,3} /.test(line)) {const level = line.indexOf(' '); out += `<h${level}>${inline(line.slice(level + 1))}</h${level}>`;}
    else if(line.trim()) out += `<p>${inline(line)}</p>`;
  }
  if(list) out += '</ul>'; if(code) out += '</code></pre>'; return out;
}
const posts = [];
for (const name of await readdir('content/posts')) {
  if (!name.endsWith('.md') || name.endsWith('.en.md')) continue;
  const raw = await readFile('content/posts/' + name, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if(!match) throw Error(`文章缺少元信息: ${name}`);
  const meta = Object.fromEntries(match[1].split('\n').map(line => {const i=line.indexOf(':'); return [line.slice(0,i).trim(),line.slice(i+1).trim()];}));
  for(const key of ['title','date','category','summary']) if(!meta[key]) throw Error(`${name} 缺少 ${key}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || !Number.isFinite(Date.parse(meta.date))) throw Error(`日期格式错误: ${name}`);
  const slug = name.slice(0,-3); if(!/^[a-z0-9-]+$/.test(slug)) throw Error(`请使用英文小写文件名: ${name}`);
  const english = await readFile('content/posts/' + slug + '.en.md', 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  let en = null;
  if (english) {
    const translated = english.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!translated) throw Error(`Invalid English post: ${slug}`);
    const fields = Object.fromEntries(translated[1].split('\n').map(line => { const i = line.indexOf(':'); return [line.slice(0,i).trim(), line.slice(i+1).trim()]; }));
    for (const key of ['title','summary','category']) if (!fields[key]) throw Error(`English post ${slug} missing ${key}`);
    en = {...fields, body: markdown(translated[2])};
  }
  posts.push({...meta, slug, body:markdown(match[2]), en});
}
posts.sort((a,b) => b.date.localeCompare(a.date));
const arrow = '<span aria-hidden="true">↗</span>';
const external = (url, text, cls='') => `<a class="${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${text}${arrow}</a>`;
const projects = [
 ['P','PaperPhonePlus','让每一次对话，都有安全感。','端到端加密即时通讯，使用 React 与 Rust 重构。','Paperphone-plus','加密通讯','mint','https://paperphone.app'],
 ['p','PaperPhoneLite','轻一点，也私密一点。','轻量级加密通讯，客户端与服务端通过 Tor 连接。','PaperPhoneLite','隐私保护','blue','https://paperphone.app'],
 ['鹤','鸣鹤','把声音，安全地传达。','纯 Rust 编写的最小化安全 SIP 语音通信服务器。','minghe','Rust · 语音通信','peach','https://minghe.mobile'],
 ['风','踏风','终端在手，随处启程。','可部署在 Cloudflare Workers 的 WebSSH 工具。','tafeng','WebSSH','lavender'],
 ['灯','归灯','心有所牵，归途有灯。','家人位置共享 App，让关心有一个落点。','guideng','位置共享','yellow'],
 ['墨','问墨','落笔之间，守住隐私。','面向 Android 的隐私保护输入法。','wenmo-android','Android · 输入法','rose']
];
const header = (home=false) => `<header><a class="brand" href="/" aria-label="一秀的自留地首页"><span class="brand-icon">秀</span><span>一秀的自留地<span class="brand-en">YIXIU'S CORNER</span></span></a><nav aria-label="主导航"><a ${home?'class="current"':''} href="${home?'':'/'}#home">首页</a><a href="${home?'':'/'}#notes">随记</a><a href="${home?'':'/'}#projects">作品</a><a href="${home?'':'/'}#about">关于</a></nav>${external('https://github.com/619dev','GitHub ', 'header-github')}<div class="preferences"><a class="language-toggle" href="/en/" lang="en" aria-label="Switch to English">EN</a><button class="theme-toggle" type="button" aria-label="切换配色" aria-pressed="false"><span class="theme-icon" aria-hidden="true">◐</span><span class="theme-label">配色</span></button></div></header>`;
const footer = `<footer><a class="footer-brand" href="/">一秀的自留地<span>写代码，也写生活。</span></a><span>© ${new Date().getFullYear()} 大贤者一秀</span><a href="#top">回到顶部 ↑</a></footer>`;
const shell = (title, description, body, home=false) => `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f7f8fc"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${home?'website':'article'}"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><script src="/preferences.js"></script><link rel="stylesheet" href="/style.css"><script src="/app.js" defer></script></head><body id="top"><a class="skip" href="#main">跳转到正文</a><div class="site">${header(home)}${body}${footer}</div></body></html>`;
const heroArt = `<div class="hero-art" aria-hidden="true"><div class="art-label">A LITTLE CODE. A LITTLE MAGIC.</div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="spark spark-one">✧</span><span class="spark spark-two">✦</span><div class="code-note"><span class="note-dots">● ● ●</span><code>const life = {<br> &nbsp;curiosity: <b>Infinity</b>,<br> &nbsp;mode: <b>"creating"</b><br>};</code></div><div class="art-core"><span>一</span><span>秀</span><small>KEEP CREATING</small></div><div class="music-note">♫<span>灵感，正在播放</span><i></i><i></i><i></i><i></i><i></i></div><div class="art-caption">天津 · EARTH · AZEROTH</div></div>`;
const home = `<main id="main"><section id="home" class="hero"><div class="hero-copy"><div class="eyebrow"><span class="status-dot"></span> 保持好奇，持续创造</div><h1>你好，我是<br><span>大贤者一秀<span class="title-dot">.</span></span></h1><p class="hero-description">从网络安全出发，在代码、音乐和艾泽拉斯之间，<br class="desktop-break">寻找一点有趣的可能。</p><div class="hero-actions"><a class="button primary" href="#projects">看看我的作品 <span>↗</span></a><a class="text-link" href="#about">多了解我一点 <span>→</span></a></div><div class="hero-meta"><span>⌖ 天津，中国</span><span>独立开发 · 兴趣驱动</span></div></div>${heroArt}</section><div class="interest-strip"><span class="strip-label">我的兴趣坐标</span><a href="#notes" class="interest"><span>⌘</span> Vibe Coding</a><a href="#channel" class="interest"><span>♫</span> AI 音乐</a><a href="#about" class="interest"><span>✧</span> 魔兽世界</a><span class="strip-end">BUILD / CREATE / PLAY</span></div><section id="projects" class="section"><div class="section-heading"><div><span class="eyebrow">SELECTED WORKS / 01</span><h2>把想法，做成作品<span class="small-dot">.</span></h2><p>一些由好奇心驱动的开源实践。</p></div>${external('https://github.com/619dev','所有 GitHub 项目 ', 'quiet-link')}</div><div class="project-grid">${projects.map(([icon,name,line,desc,repo,tag,color,website],i) => `<article class="project-card"><a class="project-main" href="${website || `https://github.com/619dev/${repo}`}" target="_blank" rel="noopener noreferrer" aria-label="${name} ${website ? '官网' : 'GitHub 源码'}"><div class="project-top"><span class="project-icon ${color}">${icon}</span><span class="project-index">0${i+1} ↗</span></div><h3>${name}</h3><p class="project-line">${line}</p><p class="project-description">${desc}</p></a><div class="project-bottom"><span>${tag}</span><div class="project-links">${website ? external(website, '官网 ') : ''}${external(`https://github.com/619dev/${repo}`, '源码 ')}</div></div></article>`).join('')}</div></section><section id="notes" class="section notes-section"><div class="section-heading"><div><span class="eyebrow">FIELD NOTES / 02</span><h2>沿途的记录<span class="small-dot">.</span></h2><p>关于技术、兴趣，以及生活里的小小发现。</p></div><span class="notes-count">${String(posts.length).padStart(2,'0')} 篇随记</span></div><div class="filters" aria-label="文章分类">${['全部','技术探索','AI 音乐','生活随记'].map((v,i) => `<button data-filter="${v}" class="${i===0?'active':''}" aria-pressed="${i===0}">${v}</button>`).join('')}</div><div class="post-list">${posts.map(post => `<a class="post-row" data-category="${escape(post.category)}" href="/posts/${post.slug}"><time datetime="${post.date}">${post.date.replaceAll('-','.')}</time><div><span class="post-category">${escape(post.category)}</span><h3>${escape(post.title)}</h3><p>${escape(post.summary)}</p></div><span class="post-arrow">↗</span></a>`).join('')}<div id="empty-posts" class="empty" hidden>这个角落还在酝酿，下一篇记录，敬请期待。</div></div></section><section id="channel" class="channel"><div><span class="eyebrow">ANOTHER SIDE OF ME</span><h2>当代码之外，<br>还有旋律。</h2><p>我的 AI 音乐兴趣，也有一个专属的角落。</p>${external('https://sonavue.channel/','前往 SonaVue 频道 ', 'button primary')}</div><div class="record-art" aria-hidden="true"><div class="record"><div class="record-center">S<span>SONAVUE</span></div></div><span class="record-star">✦</span><span class="record-caption">SOUND ON. WORLD OFF.</span></div></section><section id="about" class="section about"><div class="about-title"><span class="eyebrow">THE PERSON BEHIND / 03</span><h2>四十岁，<br>好奇心未减。</h2><div class="about-facts"><span>男 · 40 岁</span><span>⌖ 天津</span></div></div><div class="about-copy"><p>我是大贤者一秀，网络安全行业出身。早年自学编程，在一次次动手和反复练习里，慢慢把想法写成了代码。</p><p>现在，我把兴趣放在 Vibe Coding 和 AI 音乐上。也喜欢魔兽世界，在艾泽拉斯的冒险里，给日常留一点想象力。</p><p>这里是我的数字自留地，收集做过的作品，也留下一些沿途的记录。很高兴在这里遇见你。</p><div class="about-sign">一秀 <span>始终是个学习者。</span></div></div></section></main>`;
await rm('dist', {recursive:true, force:true});
await mkdir('dist/posts',{recursive:true});
await mkdir('dist/en/posts',{recursive:true});
await cp('public','dist',{recursive:true});
await emit('index.html',shell('大贤者一秀 · 代码、音乐与生活','大贤者一秀的个人博客。天津，40 岁，网络安全行业出身，热爱 Vibe Coding、AI 音乐与魔兽世界。', home,true));
for(const post of posts) await emit(`posts/${post.slug}.html`,shell(post.title+' · 一秀的自留地',post.summary,`<main id="main" class="article-main"><a href="/#notes" class="back-link">← 返回随记</a><article><div class="article-meta"><span>${escape(post.category)}</span><time datetime="${post.date}">${post.date.replaceAll('-','.')}</time></div><h1>${escape(post.title)}</h1><p class="article-summary">${escape(post.summary)}</p><div class="article-body">${post.body}</div><div class="article-end">— 大贤者一秀 · 于天津 —</div></article><a class="button primary" href="/#notes">更多随记 →</a></main>`));
await emit('404.html',shell('页面未找到 · 一秀的自留地','这个页面暂时没有找到。',`<main id="main" class="not-found"><span class="eyebrow">404 / OFF THE MAP</span><h1>好像走出了地图。</h1><p>这条路暂时没有内容，不如回自留地坐坐。</p><a class="button primary" href="/">回到首页 →</a></main>`));
console.log(`Built ${posts.length} post(s) and home page → dist/`);

async function emit(path, chinese) {
  const englishPath = '/en/' + (path === 'index.html' ? '' : path.replace(/\.html$/, ''));
  const chinesePath = '/' + (path === 'index.html' ? '' : path.replace(/\.html$/, ''));
  chinese = chinese.replace('class="language-toggle" href="/en/"', `class="language-toggle" href="${englishPath}"`);
  const extra = {};
  for (const post of posts) {
    extra[escape(post.title)] = escape(post.en?.title || post.title);
    extra[escape(post.summary)] = escape(post.en?.summary || post.summary);
    if (post.en) extra[escape(post.category)] = escape(post.en.category);
    extra[post.body] = post.en?.body || `<p class="translation-notice">This post is currently available in Chinese.</p><div lang="zh-CN">${post.body}</div>`;
  }
  let english = translate(chinese, extra)
    .replace('lang="zh-CN"', 'lang="en"')
    .replace(/(<a\b[^>]*href=")\/(?!en(?:\/|"))([^"#]*)/g, '$1/en/$2')
    .replace(/class="language-toggle" href="[^"]*" lang="en" aria-label="Switch to English">EN/, `class="language-toggle" href="${chinesePath}" lang="zh-CN" aria-label="切换到中文">中文`)
    .replace(/class="notes-count">[^<]+/, `class="notes-count">${String(posts.length).padStart(2, '0')} ${posts.length === 1 ? 'note' : 'notes'}`)
    .replace('aria-label="切换配色"', 'aria-label="Switch color theme"')
    .replace('class="theme-label">配色', 'class="theme-label">Theme');
  const alternates = `<link rel="alternate" hreflang="zh-CN" href="${chinesePath}"><link rel="alternate" hreflang="en" href="${englishPath}">`;
  await writeFile('dist/' + path, chinese.replace('</head>', alternates + '</head>'));
  await writeFile('dist/en/' + path, english.replace('</head>', alternates + '</head>'));
}
