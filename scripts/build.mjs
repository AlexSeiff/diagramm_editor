import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function build(destination = join(root, 'dist')) {
  await mkdir(destination, { recursive: true });
  const [html, css, js] = await Promise.all(
    ['index.html', 'style.css', 'app.js'].map(file => readFile(join(root, file), 'utf8'))
  );
  const modules = ['model', 'render', 'icons', 'storage', 'export'];
  await mkdir(join(destination, 'src'), { recursive: true });
  await Promise.all(modules.map(name => copyFile(join(root, 'src', name + '.js'), join(destination, 'src', name + '.js'))));
  await Promise.all(['index.html', 'style.css', 'app.js'].map(file =>
    copyFile(join(root, file), join(destination, file))
  ));
  const source = await Promise.all(modules.map(name => readFile(join(root, 'src', name + '.js'), 'utf8')));
  const bundle = [...source, js].map(code => code.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
  const standalone = html
    .replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`)
    .replace('<script type="module" src="app.js"></script>', () => `<script type="module">${bundle.replace(/<\/script/gi, '<\\/script')}</script>`);
  await writeFile(join(destination, 'Model Studio.html'), standalone);
  return destination;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Built static app and standalone HTML in ${await build()}`);
}
