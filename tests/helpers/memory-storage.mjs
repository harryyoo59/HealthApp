/** Node용 localStorage 흉내 — store 저장/불러오기 테스트용 */
export function installMemoryStorage() {
  const map = new Map();
  const storage = {
    getItem(key) {
      return map.has(String(key)) ? map.get(String(key)) : null;
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    },
    removeItem(key) {
      map.delete(String(key));
    },
    clear() {
      map.clear();
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    get length() {
      return map.size;
    }
  };
  globalThis.localStorage = storage;
  return storage;
}
