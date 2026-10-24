import { validateProject } from './model.js';
export const STORAGE_KEY = 'model-studio-v2';
const LEGACY_KEY = 'model-studio-v1', SNAPSHOT_KEY = 'model-studio-snapshots';
export function loadProject(storage) {
  const raw = storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_KEY);
  return raw ? validateProject(JSON.parse(raw)) : null;
}
export function saveProject(storage, state) { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
export function snapshots(storage) {
  const raw = storage.getItem(SNAPSHOT_KEY); if(!raw)return [];
  const list = JSON.parse(raw); if(!Array.isArray(list))throw Error('Sicherungen nicht lesbar.');
  return list.slice(0,5).map(item => ({at:item.at,state:validateProject(item.state)}));
}
export function snapshot(storage, state) {
  const list = snapshots(storage), serialized=JSON.stringify(state);
  if (list[0] && JSON.stringify(list[0].state) === serialized) return;
  list.unshift({at:new Date().toISOString(),state:validateProject(state)});
  storage.setItem(SNAPSHOT_KEY,JSON.stringify(list.slice(0,5)));
}
