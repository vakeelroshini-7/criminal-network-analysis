// Dependency-free smoke tests for the local TRACE UI event flows.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Element {
  constructor(id = '') {
    this.id = id; this.value = ''; this.textContent = ''; this.innerHTML = '';
    this.dataset = {}; this.style = {}; this.children = []; this.listeners = {};
    this.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
  }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  appendChild(node) { this.children.push(node); return node; }
  setAttribute(name, value) { this[name] = value; }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { width: 900, height: 500, left: 0, top: 0 }; }
  click() { this.clicked = true; }
  reset() { this.value = ''; }
}

const elements = new Map();
const createdElements = [];
const get = (selector) => {
  const key = selector.replace(/^#/, '');
  if (!elements.has(key)) elements.set(key, new Element(key));
  return elements.get(key);
};
const filters = ['all', 'Person', 'Organization', 'Financial'].map((f) => {
  const el = new Element(); el.dataset.filter = f; return el;
});
const nav = Array.from({ length: 6 }, () => new Element());
const storage = new Map();
const context = {
  console, Math, Date, JSON, String, Object, Array, Set, Map, Blob,
  setTimeout: (fn) => { fn(); return 1; },
  localStorage: { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
  URL: { createObjectURL: () => 'blob:smoke-test', revokeObjectURL() {} },
  window: { addEventListener() {} },
  document: {
    querySelector: get,
    querySelectorAll: (s) => s === '.filter-btn' ? filters : s === '.nav-item' ? nav : [],
    createElement: (tag) => { const el = new Element(tag); createdElements.push(el); return el; },
    createElementNS: (_ns, tag) => new Element(tag),
    addEventListener() {},
  },
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, 'app.js'), 'utf8'), context);

const check = async (name, fn) => { await fn(); console.log(`PASS ${name}`); };
async function run() {
await check('initial sample dashboard renders 12 entities and 18 links', () => {
  assert.equal(get('#entityCount').textContent, 12);
  assert.equal(get('#linkCount').textContent, 18);
  assert.equal(get('#visibleCount').textContent, 12);
});

await check('example: add a synthetic entity and persist it locally', () => {
  get('#entityName').value = 'Example Review Entity';
  get('#entitySource').value = 'DEMO-EXAMPLE-001';
  get('#entityForm').onsubmit({ preventDefault() {}, target: { reset() {} } });
  assert.equal(get('#entityCount').textContent, 13);
  assert.equal(JSON.parse(storage.get('trace-case-v1')).people.length, 13);
});

await check('example: add a source-referenced relationship', () => {
  get('#linkFrom').value = 'P-001'; get('#linkTo').value = 'X-001';
  get('#linkSource').value = 'DEMO-EXAMPLE-LINK-001';
  get('#linkType').value = 'Documented meeting';
  get('#linkForm').onsubmit({ preventDefault() {} });
  assert.equal(get('#linkCount').textContent, 19);
  assert.equal(JSON.parse(storage.get('trace-case-v1')).links.length, 19);
});

await check('example: shortest path returns a documented route', () => {
  get('#pathFrom').value = 'P-001'; get('#pathTo').value = 'P-005';
  get('#runPath').onclick();
  assert.match(get('#pathResult').innerHTML, /documented links found/);
  assert.match(get('#pathResult').innerHTML, /Mara Voss/);
  assert.match(get('#pathResult').innerHTML, /Sana Malik/);
});

await check('example: import one entity and one linked record from CSV', async () => {
  const csv = [
    'name,type,source,community,from,to,relationship,source_ref,note',
    'CSV Sample,Person,DEMO-CSV-1,2,,,,,',
    ',,,,CSV Sample,Example Review Entity,Communication,DEMO-CSV-LINK-1,Authorized sample',
  ].join('\n');
  await get('#csvFile').onchange({ target: { files: [{ name: 'example.csv', text: async () => csv }], value: 'example.csv' } });
  assert.equal(get('#entityCount').textContent, 14);
  assert.equal(get('#linkCount').textContent, 20);
  assert.match(get('#toast').textContent, /2 added, 0 skipped/);
});

await check('example: JSON export prepares a downloadable snapshot', () => {
  get('#exportBtn').onclick();
  assert.equal(createdElements.at(-1).clicked, true);
});

console.log('TRACE smoke checks passed. All test records are in an isolated mock browser and were not written to the real case.');
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
