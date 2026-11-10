import { articles, categories } from './data.mjs';
import { createEngine } from './engine.mjs';

const icons = Object.freeze({
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2ZM8 7h8M8 11h6',
  search: 'M21 21l-4.2-4.2M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  chat: 'M20.5 14.5a3 3 0 0 1-3 3H9l-5.5 4v-16a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3zM8 8h8M8 12h6',
  key: 'M15.5 13a5.5 5.5 0 1 0-4.8-2.8L3 18v3h4v-3h3v-3l2-2m5.5-5.5h.01',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  check: 'M4 12l5 5 11-11',
  shield: 'M12 2l8 4v6c0 4-3 8-8 10-5-2-8-6-8-10V6zM8 12l3 3 5-5',
  swap: 'M4 7h15l-4-4M20 17H5l4 4',
  file: 'M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6',
  star: 'm12 2 3.1 6.3 7 .9-5 4.9 1.1 6.9-6.2-3.3L5.8 21 7 14.1l-5-4.9 7-.9z',
  moon: 'M20.9 13.7A9 9 0 0 1 10.3 3.1 9 9 0 1 0 20.9 13.7z',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'
});
const engine = createEngine(articles, categories);
const articleById = new Map(articles.map(article => [article.id, article]));
const categoryById = new Map(categories.map(category => [category.id, category]));
const get = id => document.getElementById(id);
const sections = { catalogo: get('catalog'), assistente: get('assistant'), favoritos: get('favorites'), processo: get('detail') };

function readLocal(key) {
  try { return localStorage.getItem('atlas-demo-' + key); } catch { return null; }
}
function saveLocal(key, value) {
  try { localStorage.setItem('atlas-demo-' + key, value); } catch { /* A interface funciona sem armazenamento. */ }
}
function loadFavorites() {
  try {
    const saved = JSON.parse(readLocal('favorites') || '[]');
    return new Set(Array.isArray(saved) ? saved.filter(id => articleById.has(id)) : []);
  } catch { return new Set(); }
}
const favorites = loadFavorites();
let theme = readLocal('theme') === 'dark' ? 'dark' : 'light';
let category = 'todos';
let previousId = '';
let view = 'catalogo';

function element(tag, className = '', text = '') {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}
function setIcon(target, name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.75');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', icons[name] || icons.book);
  svg.append(path);
  target.replaceChildren(svg);
}
function announce(message) { get('announcement').textContent = message; }
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  setIcon(get('theme'), dark ? 'sun' : 'moon');
  get('theme').setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
}
function articleLink(id, section = '') {
  return '#processo/' + id + (section ? '?secao=' + encodeURIComponent(section) : '');
}
function saveButton(article, labeled = false) {
  const button = element('button', labeled ? 'secondary' : '');
  button.type = 'button';
  button.dataset.favoriteId = article.id;
  if (labeled) button.dataset.labeled = 'true';
  button.addEventListener('click', () => {
    const wasSaved = favorites.has(article.id);
    if (wasSaved) favorites.delete(article.id);
    else favorites.add(article.id);
    saveLocal('favorites', JSON.stringify([...favorites]));
    if (view === 'favoritos') {
      renderFavorites();
      get('favorites-title').focus();
    } else {
      document.querySelectorAll('[data-favorite-id]').forEach(syncSaveButton);
    }
    announce(wasSaved ? 'Removido dos favoritos.' : 'Adicionado aos favoritos.');
  });
  syncSaveButton(button);
  return button;
}
function syncSaveButton(button) {
  const saved = favorites.has(button.dataset.favoriteId);
  const label = saved ? 'Remover dos favoritos' : 'Salvar nos favoritos';
  const article = articleById.get(button.dataset.favoriteId);
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', label + ': ' + article.title);
  button.title = label;
  if (button.dataset.labeled) button.textContent = saved ? 'Salvo nos favoritos' : label;
  else setIcon(button, 'star');
}
function card(article) {
  const root = element('article', 'card');
  const top = element('div', 'card-top');
  const tile = element('span', 'tile');
  setIcon(tile, article.icon);
  top.append(tile, saveButton(article));
  const link = element('a', '', 'Abrir procedimento →');
  link.href = articleLink(article.id);
  link.setAttribute('aria-label', 'Abrir procedimento: ' + article.title);
  root.append(top, element('p', 'card-cat', categoryById.get(article.categoryId).title),
    element('h3', '', article.title), element('p', '', article.summary), link);
  return root;
}
function renderCatalog() {
  const matches = engine.search(get('search').value, category);
  get('results').textContent = matches.length + (matches.length === 1 ? ' processo' : ' processos');
  get('cards').replaceChildren(...matches.map(match => card(articleById.get(match.id))));
  if (!matches.length) get('cards').append(element('p', 'empty', 'Nenhum procedimento encontrado. Tente outro termo ou selecione Todas.'));
  for (const button of get('filters').children) button.setAttribute('aria-pressed', String(button.dataset.category === category));
}
function renderFavorites() {
  const cards = get('favorite-cards');
  cards.replaceChildren(...[...favorites].map(id => card(articleById.get(id))));
  if (!favorites.size) cards.append(element('p', 'empty', 'Você ainda não salvou procedimentos. Use a estrela de um cartão do catálogo.'));
}
function renderArticle(id, sectionTitle) {
  const article = articleById.get(id);
  const panel = element('div', 'article-panel');
  const heading = element('h1', '', article?.title || 'Procedimento não encontrado');
  heading.id = 'detail-title';
  heading.tabIndex = -1;
  if (!article) {
    panel.append(heading, element('p', 'article-desc', 'Volte ao catálogo para escolher um dos procedimentos de demonstração.'));
    get('article').replaceChildren(panel);
    return heading;
  }
  panel.append(element('p', 'eyebrow', categoryById.get(article.categoryId).title + ' · Processo fictício'),
    heading, element('p', 'article-desc', article.summary), saveButton(article, true));
  let highlight = null;
  for (const section of article.sections) {
    const block = element('section', 'article-section');
    const title = element('h2', '', section.title);
    title.tabIndex = -1;
    block.append(title, element('p', '', section.text));
    if (section.title === sectionTitle) {
      block.classList.add('highlight');
      highlight = title;
    }
    panel.append(block);
  }
  get('article').replaceChildren(panel);
  return highlight || heading;
}
function route(focus = false) {
  const hash = location.hash.slice(1);
  if (hash === 'main') return;
  const [path, query] = hash.split('?');
  const [page, id] = path.split('/');
  view = Object.hasOwn(sections, page) ? page : 'catalogo';
  for (const [key, value] of Object.entries(sections)) value.hidden = key !== view;
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === (view === 'processo' ? 'catalogo' : view)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  let target;
  if (view === 'processo') target = renderArticle(id, new URLSearchParams(query).get('secao'));
  else {
    if (view === 'catalogo') renderCatalog();
    if (view === 'favoritos') renderFavorites();
    target = sections[view].querySelector('h1');
    target.tabIndex = -1;
  }
  if (focus || (view === 'processo' && query)) {
    window.scrollTo(0, 0);
    target.focus({ preventScroll: true });
    if (target.closest('.highlight')) target.scrollIntoView({ block: 'center' });
  }
}
function addMessage(type, text, response) {
  const messages = get('messages');
  const box = element('div', 'bubble' + (type === 'user' ? ' user' : ''));
  box.append(element('p', '', text));
  if (response?.source) {
    const { id, title, section } = response.source;
    const source = element('a', 'source', 'Fonte: ' + title + ' › ' + section);
    source.href = articleLink(id, section);
    const tags = [response.intent];
    if (response.contextual) tags.push('Contexto da pergunta anterior');
    if (response.corrections.length) tags.push('Correção: ' + response.corrections.map(c => c.de + ' → ' + c.para).join(', '));
    const details = element('details');
    details.append(element('summary', '', 'Como a fonte foi escolhida'),
      element('p', '', response.evidence.map(item => item.toLowerCase().replaceAll('_', ' ')).join(' · ')));
    box.append(source, element('small', '', tags.join(' · ')), details);
  }
  messages.append(box);
  while (messages.childElementCount > 25) messages.firstElementChild.remove();
  messages.scrollTop = messages.scrollHeight;
}
function resetChat() {
  previousId = '';
  get('messages').replaceChildren();
  addMessage('assistant', 'Olá! Posso ajudar a localizar etapas, requisitos e prazos nos procedimentos fictícios do catálogo.');
}
function sendQuestion(text) {
  text = text.trim();
  if (!text) return;
  addMessage('user', text);
  const response = engine.ask(text, previousId);
  if (response.source) previousId = response.source.id;
  else if (response.type === 'no-source' || response.type === 'blocked') previousId = '';
  addMessage('assistant', response.text, response);
  get('question').value = '';
}

for (const group of [{ id: 'todos', title: 'Todas' }, ...categories]) {
  const button = element('button', 'filter', group.title);
  button.type = 'button';
  button.dataset.category = group.id;
  button.addEventListener('click', () => { category = group.id; renderCatalog(); });
  get('filters').append(button);
}
for (const query of ['Como abro um chamdo?', 'Como redefinir a snha?', 'Quero trocar de dono', 'Quais são os requisitos para solicitar acesso?', 'Qual é a previsão do tempo?']) {
  const button = element('button', 'secondary', query);
  button.type = 'button';
  button.addEventListener('click', () => { sendQuestion(query); get('question').focus(); });
  get('examples').append(button);
}
for (const [id, icon] of [['brand-icon', 'book'], ['hero-icon', 'book'], ['search-icon', 'search'], ['chat-icon', 'chat']]) setIcon(get(id), icon);
get('theme').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; saveLocal('theme', theme); applyTheme(); });
get('search').addEventListener('input', renderCatalog);
get('reset-chat').addEventListener('click', () => { resetChat(); get('question').focus(); });
get('ask-form').addEventListener('submit', event => { event.preventDefault(); sendQuestion(get('question').value); });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (view !== 'catalogo') {
      location.hash = '#catalogo';
      window.addEventListener('hashchange', () => get('search').focus(), { once: true });
    } else get('search').focus();
  }
});
window.addEventListener('hashchange', () => route(true));
applyTheme();
resetChat();
route();
