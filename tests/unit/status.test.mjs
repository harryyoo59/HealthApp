import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { installMemoryStorage } from "../helpers/memory-storage.mjs";
import {
  normalizeLabPanel,
  buildLabPanelOpinion
} from "../../public/js/labs.js";

describe("status 검사 의견 반영", () => {
  let store;
  let status;

  before(async () => {
    installMemoryStorage();
    store = await import("../../public/js/store.js");
    status = await import("../../public/js/status.js");
  });

  it("검사가 없으면 pack이 null이다", () => {
    store.setState(store.createEmptyBodyState());
    assert.equal(status.getLatestLabOpinionPack(), null);
  });

  it("최근 검사 의견을 상태에 붙인다", () => {
    const panel = normalizeLabPanel({
      date: "2024-06-01",
      values: { ldl: "180" }
    });
    store.setState(
      Object.assign(store.createEmptyBodyState(), { labPanels: [panel] })
    );
    const pack = status.getLatestLabOpinionPack();
    assert.ok(pack);
    assert.equal(pack.opinion.level, "alert");
    assert.equal(buildLabPanelOpinion(panel).level, "alert");

    const block = status.formatLabOpinionForStatus(pack);
    assert.match(block, /검사 참고/);
    assert.match(block, /LDL/);

    const detail = status.appendLabOpinionToStatusDetail("판단: 걷기 보완");
    assert.match(detail, /판단: 걷기 보완/);
    assert.match(detail, /검사 참고/);
    // 두 번 붙여도 한 번만
    const again = status.appendLabOpinionToStatusDetail(detail);
    assert.equal(again, detail);
  });
});
