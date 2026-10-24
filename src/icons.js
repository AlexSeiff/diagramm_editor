const paths = {
  layers:'M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  folder:'M3 6h7l2 3h9v11H3V6Z',save:'M5 3h12l3 3v15H4V3h1ZM8 3v6h8V3M8 21v-8h8v8',export:'M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8',
  history:'M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v6l4 2',help:'M9 9a3 3 0 1 1 4 3c-1 1-1 1-1 3m0 3h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  chevron:'m14 6-6 6 6 6',bulb:'M9 18h6m-6 3h6M8 15c-6-5-2-12 4-12s10 7 4 12l-1 1H9l-1-1Z',library:'M3 4h5v16H3V4Zm8 0h4v16h-4V4Zm7 0 4 15-3 1-4-15 3-1Z',
  cursor:'m5 3 14 9-7 1-3 7L5 3Z',connect:'M5 5h6v6H5V5Zm8 8h6v6h-6v-6Zm-2-5h5v5',hand:'M8 13V5a2 2 0 0 1 4 0v6-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 5-3 7-7 7-3 0-5-2-7-5l-3-5a2 2 0 0 1 3-2l2 3Z',
  undo:'M4 9h10a6 6 0 0 1 0 12M4 9l5-5M4 9l5 5',redo:'M20 9H10a6 6 0 0 0 0 12m14-12-5-5m5 5-5 5',settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6',template:'M3 3h18v18H3V3Zm0 6h18M9 9v12',check:'m5 12 4 4 10-11M4 21h16',trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  fit:'M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6',minus:'M5 12h14',plus:'M5 12h14M12 5v14',shield:'m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Zm-4 10 3 3 5-6',close:'m6 6 12 12M18 6 6 18',copy:'M8 8h13v13H8V8ZM3 16V3h13',up:'m6 14 6-6 6 6',down:'m6 10 6 6 6-6'
};
export function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.layers}"/></svg>`; }
export function hydrateIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { if(!el.querySelector('.icon'))el.insertAdjacentHTML('afterbegin',icon(el.dataset.icon)); }); }
