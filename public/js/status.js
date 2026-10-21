/** 현재 내몸 상태용 검사 참고 반영 */
import { getState } from './store.js';
import {
  normalizeLabPanels,
  labPanelHasBits,
  buildLabPanelOpinion,
  formatLabDateKo
} from './labs.js';

export function getLatestLabOpinionPack() {
  var panels = normalizeLabPanels(getState().labPanels);
  if (!panels.length) return null;
  var panel = panels[0];
  if (!labPanelHasBits(panel)) return null;
  return { panel: panel, opinion: buildLabPanelOpinion(panel) };
}

export function formatLabOpinionForStatus(pack) {
  if (!pack || !pack.opinion || !pack.opinion.lines || !pack.opinion.lines.length) return "";
  var dateKo = formatLabDateKo(pack.panel.date);
  return "검사 참고(" + dateKo + "):\n" + pack.opinion.lines.join("\n");
}

export function appendLabOpinionToStatusDetail(detail) {
  var labBlock = formatLabOpinionForStatus(getLatestLabOpinionPack());
  if (!labBlock) return String(detail || "").trim();
  var d = String(detail || "").trim();
  if (d.indexOf("검사 참고(") >= 0) return d;
  return d ? (d + "\n\n" + labBlock) : labBlock;
}

