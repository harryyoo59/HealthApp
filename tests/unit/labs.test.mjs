import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyLabPanel,
  normalizeLabPanel,
  normalizeLabPanels,
  labPanelHasBits,
  mergeLabPanel,
  parseLabReportText,
  buildLabPanelOpinion,
  formatLabDateKo
} from "../../public/js/labs.js";

describe("labs 파서·의견", () => {
  it("emptyLabPanel은 빈 칸을 만든다", () => {
    const p = emptyLabPanel();
    assert.equal(p.date, "");
    assert.equal(p.values.ldl, "");
    assert.equal(labPanelHasBits(p), false);
  });

  it("normalizeLabPanel이 값을 정리한다", () => {
    const p = normalizeLabPanel({ date: "2024-05-01", values: { ldl: " 140 ", hdl: "" } });
    assert.equal(p.date, "2024-05-01");
    assert.equal(p.values.ldl, "140");
    assert.equal(labPanelHasBits(p), true);
  });

  it("parseLabReportText가 LDL·날짜를 읽는다", () => {
    const text = [
      "Collected 12-May-2024",
      "LDL Chol. 148 mg/dL",
      "HDL Chol. 52 mg/dL",
      "Triglycerides 130",
      "HbA1c 5.6 %"
    ].join("\n");
    const parsed = parseLabReportText(text);
    assert.ok(parsed.hitCount >= 3);
    assert.equal(parsed.panel.date, "2024-05-12");
    assert.equal(parsed.panel.values.ldl, "148");
    assert.equal(parsed.panel.values.hdl, "52");
    assert.equal(parsed.panel.values.hba1c, "5.6");
  });

  it("mergeLabPanel이 숫자만 덮어쓴다", () => {
    const a = normalizeLabPanel({ date: "2024-01-01", values: { ldl: "100", hdl: "50" } });
    const b = normalizeLabPanel({ date: "2024-02-01", values: { ldl: "160" } });
    const m = mergeLabPanel(a, b);
    assert.equal(m.date, "2024-02-01");
    assert.equal(m.values.ldl, "160");
    assert.equal(m.values.hdl, "50");
  });

  it("buildLabPanelOpinion이 높은 LDL에 alert를 준다", () => {
    const opinion = buildLabPanelOpinion(
      normalizeLabPanel({ date: "2024-01-01", values: { ldl: "180" } })
    );
    assert.equal(opinion.level, "alert");
    assert.ok(opinion.lines.some((line) => /LDL/.test(line)));
    assert.equal(opinion.seeDoctor, true);
  });

  it("formatLabDateKo가 한글 날짜를 만든다", () => {
    assert.equal(formatLabDateKo("2024-05-12"), "2024년 05월 12일");
  });

  it("normalizeLabPanels가 빈 항목을 걸러낸다", () => {
    const list = normalizeLabPanels([
      { date: "", values: {} },
      { date: "2024-01-01", values: { ldl: "90" } }
    ]);
    assert.equal(list.length, 1);
  });
});
