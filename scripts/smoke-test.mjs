import { JSDOM, VirtualConsole } from 'jsdom';
import fs from 'node:fs';

const bundle = fs.readFileSync('/tmp/agencyos-bundle.js', 'utf8');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));

const routes = ['', 'leads', 'clients', 'subscriptions', 'payments', 'proposals', 'shootings', 'media', 'videos', 'timeline', 'staff', 'equipment', 'learning', 'settings'];

for (const r of routes) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
    runScripts: 'outside-only',
    url: `http://localhost/#/${r}`,
    pretendToBeVisual: true,
    virtualConsole: vc,
  });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = (id) => clearTimeout(id);
  w.URL.createObjectURL = () => 'blob:fake';
  try {
    w.eval(bundle);
  } catch (e) {
    errors.push(`[${r}] eval: ${e.message}`);
    continue;
  }
  await new Promise((res) => setTimeout(res, 60));
  const html = w.document.getElementById('root').innerHTML;
  const len = html.length;
  const txt = w.document.getElementById('root').textContent || '';
  const status = len > 500 ? 'OK' : 'EMPTY?';
  console.log(`${(r || 'dashboard').padEnd(15)} ${status.padEnd(7)} dom=${String(len).padStart(6)} text="${txt.slice(0, 60).replace(/\s+/g, ' ')}"`);
  dom.window.close();
}

console.log('\n--- errors ---');
if (errors.length === 0) console.log('none');
else errors.slice(0, 20).forEach((e) => console.log(e.slice(0, 400)));
process.exit(errors.length ? 1 : 0);
