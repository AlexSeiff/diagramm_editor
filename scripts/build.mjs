import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function build(destination = join(root, 'dist')) {
  await mkdir(destination, { recursive: true });
  const [html, css, js] = await Promise.all(
    ['index.html', 'style.css', 'app.js'].map(file => readFile(join(root, file), 'utf8'))
  );
  await Promise.all(['index.html', 'style.css', 'app.js'].map(file =>
    copyFile(join(root, file), join(destination, file))
  ));
  const standalone = html
    .replace('<link rel="stylesheet" href="style.css">', () => `<style>${css}</style>`)
    .replace('<script src="app.js"></script>', () => `<script>${js}</script>`);
  await writeFile(join(destination, 'Model Studio.html'), standalone);
  return destination;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Built static app and standalone HTML in ${await build()}`);
}
