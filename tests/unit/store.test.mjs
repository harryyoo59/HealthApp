import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { installMemoryStorage } from "../helpers/memory-storage.mjs";

describe("store 저장·불러오기", () => {
  let store;

  before(async () => {
    installMemoryStorage();
    store = await import("../../public/js/store.js");
  });

  it("createEmptyBodyState가 기본 골격을 준다", () => {
    const s = store.createEmptyBodyState();
    assert.equal(s.sex, "");
    assert.deepEqual(s.labPanels, []);
  });

  it("saveState / loadState가 localStorage에 오간다", () => {
    store.configureStore({
      normalizeBodyBasics(raw) {
        return Object.assign(store.createEmptyBodyState(), raw || {});
      }
    });
    store.setState(
      Object.assign(store.createEmptyBodyState(), {
        sex: "male",
        age: "67",
        weight: "81"
      })
    );
    let after = 0;
    store.configureStore({
      normalizeBodyBasics(raw) {
        return Object.assign(store.createEmptyBodyState(), raw || {});
      },
      afterSave() {
        after += 1;
      }
    });
    store.saveState();
    assert.equal(after, 1);
    const raw = localStorage.getItem(store.STORAGE_KEY);
    assert.ok(raw && raw.includes('"sex":"male"'));
    store.setState(store.createEmptyBodyState());
    const loaded = store.loadState();
    assert.equal(loaded.sex, "male");
    assert.equal(loaded.age, "67");
    assert.equal(loaded.weight, "81");
  });

  it("persistSetItem 실패 시 핸들러를 부른다", () => {
    let seen = null;
    store.configureStore({
      onPersistFail(err) {
        seen = err;
      }
    });
    const original = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error("quota");
    };
    const ok = store.persistSetItem("x", "y");
    localStorage.setItem = original;
    assert.equal(ok, false);
    assert.ok(seen);
  });
});
