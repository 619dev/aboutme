import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import './build.mjs';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + path);
    if (file !== root && !file.startsWith(root + sep)) throw Error('Invalid path');
    if (!extname(file)) file = (await stat(file).catch(() => null))?.isDirectory() ? resolve(file, 'index.html') : file + '.html';
    const data = await readFile(file); res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'}); res.end(data);
  } catch { res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}); res.end(await readFile(resolve(root,'404.html'))); }
}).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + (process.env.PORT || 3000)));
