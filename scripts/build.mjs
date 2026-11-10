import { readFileSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const css = read('src/styles.css');
const code = ['src/data.mjs', 'src/engine.mjs', 'src/app.mjs'].map(path =>
  read(path).replace(/^import .*;\s*$/gm, '').replace(/^export /gm, '')
).join('\n');
const html = read('src/shell.html').replace('/* STYLES */', () => css)
  .replace('/* APP */', () => "'use strict';\n(() => {\n" + code.replace(/<\/script/gi, '<\\/script') + '\n})();');
writeFileSync(new URL('../index.html', import.meta.url), html);
