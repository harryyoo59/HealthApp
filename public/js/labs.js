/** 검사표 파싱·의견 (순수 로직) */
export const LAB_PANEL_FIELDS = [
  { id: "fastingGlucose", group: "blood", label: "공복혈당", alias: "Glucose, FBS", placeholder: "건강참고 90" },
  { id: "hba1c", group: "blood", label: "당화혈색소", alias: "HbA1c", placeholder: "건강참고 5.4" },
  { id: "totalChol", group: "blood", label: "총콜레스테롤", alias: "Total Cholesterol, TC", placeholder: "건강참고 180" },
  { id: "hdl", group: "blood", label: "HDL", alias: "HDL-C", placeholder: "건강참고 55" },
  { id: "ldl", group: "blood", label: "LDL", alias: "LDL-C", placeholder: "건강참고 90" },
  { id: "tg", group: "blood", label: "중성지방", alias: "Triglyceride, TG", placeholder: "건강참고 100" },
  { id: "ast", group: "blood", label: "AST", alias: "GOT, AST", placeholder: "건강참고 22" },
  { id: "alt", group: "blood", label: "ALT", alias: "GPT, ALT", placeholder: "건강참고 22" },
  { id: "creatinine", group: "blood", label: "크레아티닌", alias: "Creatinine", placeholder: "건강참고 0.9" },
  { id: "egfr", group: "blood", label: "eGFR", alias: "GFR, eGFR", placeholder: "건강참고 95" },
  { id: "uricAcid", group: "blood", label: "요산", alias: "Uric acid", placeholder: "건강참고 5.0" },
  { id: "hemoglobin", group: "blood", label: "혈색소", alias: "Hemoglobin, Hb", placeholder: "건강참고 14.0" },
  { id: "urineProtein", group: "urine", label: "단백", alias: "Protein, Albumin", placeholder: "건강참고 (-)" },
  { id: "urineBlood", group: "urine", label: "잠혈", alias: "Occult blood, OB", placeholder: "건강참고 (-)" },
  { id: "urineGlucose", group: "urine", label: "당", alias: "Glucose", placeholder: "건강참고 (-)" }
];

function pad2(n) {
  var s = String(n == null ? "" : n);
  if (s.length === 1) return "0" + s;
  return s;
}

export function emptyLabPanel() {
  var values = {};
  LAB_PANEL_FIELDS.forEach(function (f) { values[f.id] = ""; });
  return { date: "", values: values };
}

export function normalizeLabPanel(raw) {
  var base = emptyLabPanel();
  if (!raw || typeof raw !== "object") return base;
  base.date = String(raw.date || "").trim();
  var src = raw.values && typeof raw.values === "object" ? raw.values : raw;
  LAB_PANEL_FIELDS.forEach(function (f) {
    base.values[f.id] = String(src[f.id] || "").trim();
  });
  return base;
}

export function normalizeLabPanels(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeLabPanel).filter(function (p) {
    return labPanelHasBits(p);
  });
}

export function labPanelHasBits(panel) {
  panel = normalizeLabPanel(panel);
  if (panel.date) return true;
  return LAB_PANEL_FIELDS.some(function (f) {
    return !!panel.values[f.id];
  });
}

export function labPanelsHasBits(list) {
  return normalizeLabPanels(list).length > 0;
}

export function formatLabPanelValuesLine(panel) {
  panel = normalizeLabPanel(panel);
  var bits = [];
  LAB_PANEL_FIELDS.forEach(function (f) {
    var v = panel.values[f.id];
    if (v) bits.push(f.label + " " + v);
  });
  return bits.join(", ");
}

export function formatLabPanelLine(panel) {
  panel = normalizeLabPanel(panel);
  var bits = formatLabPanelValuesLine(panel);
  var head = formatLabDateKo(panel.date);
  return bits ? (head + " · " + bits) : head;
}

export function formatLabPanelsAsText(panels, memo) {
  var lines = normalizeLabPanels(panels).map(formatLabPanelLine);
  var m = String(memo || "").trim();
  if (m) lines.push(m);
  return lines.join("\n");
}

export function formatLabDateKo(iso) {
  var m = String(iso || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso || "").trim() || "날짜 없음";
  return m[1] + "년 " + m[2] + "월 " + m[3] + "일";
}

export function formatLabDateShort(iso) {
  var m = String(iso || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso || "").trim() || "날짜없음";
  return m[2].replace(/^0/, "") + "/" + m[3].replace(/^0/, "");
}

export function mergeLabPanel(into, from) {
  var base = normalizeLabPanel(into);
  var add = normalizeLabPanel(from);
  if (add.date) base.date = add.date;
  LAB_PANEL_FIELDS.forEach(function (f) {
    if (add.values[f.id]) base.values[f.id] = add.values[f.id];
  });
  return base;
}

export function parseLabReportText(rawText) {
  var text = String(rawText || "").replace(/\r/g, "\n");
  // OCR 흔한 오인식(O/0, l/1, S/5 등)을 숫자 근처에서만 완화
  text = text
    .replace(/HbA[lI1]c/gi, "HbA1c")
    .replace(/HBA[lI1]C/gi, "HbA1c")
    .replace(/\bLD[lI]\b/gi, "LDL")
    .replace(/\bHD[lI]\b/gi, "HDL")
    .replace(/eGFR/gi, "eGFR")
    .replace(/Creatlnlne/gi, "Creatinine")
    .replace(/Tr[i1]glycer/gi, "Triglycer");
  var flat = text.replace(/\s+/g, " ").trim();
  var panel = emptyLabPanel();
  var memoBits = [];
  var monthMap = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  };
  var foundDates = [];
  var dateRe = /(\d{1,2})[-\/\s.](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\/\s.](\d{2,4})/gi;
  var dm;
  while ((dm = dateRe.exec(text))) {
    var yy = Number(dm[3]);
    if (yy < 100) yy += 2000;
    var mo = monthMap[String(dm[2]).slice(0, 3).toLowerCase()];
    var dd = Number(dm[1]);
    if (mo && dd >= 1 && dd <= 31 && yy >= 1990 && yy <= 2100) {
      foundDates.push(yy + "-" + pad2(mo) + "-" + pad2(dd));
    }
  }
  var isoRe = /(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/g;
  while ((dm = isoRe.exec(flat))) {
    var y2 = Number(dm[1]);
    var m2 = Number(dm[2]);
    var d2 = Number(dm[3]);
    if (y2 >= 1990 && y2 <= 2100 && m2 >= 1 && m2 <= 12 && d2 >= 1 && d2 <= 31) {
      foundDates.push(y2 + "-" + pad2(m2) + "-" + pad2(d2));
    }
  }
  if (foundDates.length) panel.date = foundDates[foundDates.length - 1];

  function pick(patterns) {
    for (var i = 0; i < patterns.length; i++) {
      var m = flat.match(patterns[i]);
      if (!m) m = text.match(patterns[i]);
      if (!m) continue;
      var n = parseFloat(String(m[1]).replace(/,/g, "").replace(/[Oo]/g, "0").replace(/[lI]/g, "1"));
      if (isFinite(n)) return n;
    }
    return null;
  }

  function fmt1(n) {
    return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, "");
  }

  var glu = pick([
    /F\s*Gluc(?:ose)?(?:\s+(?:Serum|Plasma))?[^\d]{0,40}(\d+\.?\d*)/i,
    /(?:Fasting\s+)?(?:Plasma\s+|Serum\s+)?Glucose[^\d]{0,40}(\d+\.?\d*)/i,
    /공복혈당[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (glu != null) {
    panel.values.fastingGlucose = String(Math.round(glu < 40 ? glu * 18.018 : glu));
  }

  var hba = pick([
    /HbA1c[^\d]{0,28}(\d+\.?\d*)/i,
    /당화혈색소[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (hba != null) panel.values.hba1c = fmt1(hba);

  var chol = pick([
    /Total\s*Cholesterol[^\d]{0,36}(\d+\.?\d*)/i,
    /Cholesterol(?!\s*(?:HDL|LDL|Non))[^\d]{0,36}(\d+\.?\d*)/i,
    /총콜레스테롤[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (chol != null) {
    panel.values.totalChol = String(Math.round(chol < 20 ? chol * 38.67 : chol));
  }

  var tg = pick([
    /Triglycerides?[^\d]{0,36}(\d+\.?\d*)/i,
    /중성지방[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (tg != null) {
    panel.values.tg = String(Math.round(tg < 30 ? tg * 88.57 : tg));
  }

  var hdl = pick([
    /HDL\s*Chol\.?[^\d]{0,36}(\d+\.?\d*)/i,
    /HDL[-\s]?C(?![a-z])[^\d]{0,28}(\d+\.?\d*)/i
  ]);
  if (hdl != null) {
    panel.values.hdl = String(Math.round(hdl < 5 ? hdl * 38.67 : hdl));
  }

  var ldl = pick([
    /LDL\s*Chol\.?[^\d]{0,36}(\d+\.?\d*)/i,
    /LDL[-\s]?C(?![a-z])[^\d]{0,28}(\d+\.?\d*)/i
  ]);
  if (ldl != null) {
    panel.values.ldl = String(Math.round(ldl < 15 ? ldl * 38.67 : ldl));
  }

  var ast = pick([
    /\bAST\b[^\d]{0,36}(\d+\.?\d*)/i,
    /\bGOT\b[^\d]{0,28}(\d+\.?\d*)/i
  ]);
  if (ast != null) panel.values.ast = String(Math.round(ast));

  var alt = pick([
    /\bALT\b[^\d]{0,36}(\d+\.?\d*)/i,
    /\bGPT\b[^\d]{0,28}(\d+\.?\d*)/i
  ]);
  if (alt != null) panel.values.alt = String(Math.round(alt));

  var crea = pick([
    /Creatinine[^\d]{0,36}(\d+\.?\d*)/i,
    /크레아티닌[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (crea != null) {
    panel.values.creatinine = crea > 20
      ? fmt1(crea / 88.4)
      : fmt1(crea);
  }

  var egfr = pick([
    /eGFR[^\d]{0,36}(\d+\.?\d*)/i,
    /\bGFR\b[^\d]{0,28}(\d+\.?\d*)/i
  ]);
  if (egfr != null) panel.values.egfr = String(Math.round(egfr));

  var uric = pick([
    /Urate[^\d]{0,36}(\d+\.?\d*)/i,
    /Uric\s*acid[^\d]{0,36}(\d+\.?\d*)/i,
    /요산[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (uric != null) {
    panel.values.uricAcid = uric < 2
      ? fmt1(uric * 16.81)
      : fmt1(uric);
  }

  var hb = pick([
    /Haemoglobin[^\d]{0,36}(\d+\.?\d*)/i,
    /Hemoglobin[^\d]{0,36}(\d+\.?\d*)/i,
    /\bHb\b[^\d]{0,20}(\d+\.?\d*)/i,
    /혈색소[^\d]{0,24}(\d+\.?\d*)/
  ]);
  if (hb != null) {
    panel.values.hemoglobin = hb > 40 ? fmt1(hb / 10) : fmt1(hb);
  }

  var ferr = pick([/Ferritin[^\d]{0,36}(\d+\.?\d*)/i]);
  if (ferr != null) memoBits.push("Ferritin " + Math.round(ferr));
  var tsh = pick([/\bTSH\b[^\d]{0,36}(\d+\.?\d*)/i]);
  if (tsh != null) memoBits.push("TSH " + fmt1(tsh));

  return {
    panel: panel,
    memoExtra: memoBits.join(" / "),
    hitCount: LAB_PANEL_FIELDS.reduce(function (n, f) {
      return n + (panel.values[f.id] ? 1 : 0);
    }, 0) + (panel.date ? 1 : 0) + (memoBits.length ? 1 : 0)
  };
}

export function summarizeParsedLab(parsed) {
  var lines = [];
  if (parsed.panel.date) lines.push("검사일 " + formatLabDateKo(parsed.panel.date));
  LAB_PANEL_FIELDS.forEach(function (f) {
    var v = parsed.panel.values[f.id];
    if (v) lines.push(f.label + " " + v);
  });
  if (parsed.memoExtra) lines.push("기타 " + parsed.memoExtra);
  if (!lines.length) return "표에서 숫자를 찾지 못했습니다. 직접 입력해 주세요.";
  return "아래처럼 넣을게요. 확인 후 저장합니다.\n\n" + lines.join("\n");
}

export function parseLabNumber(raw) {
  var n = parseFloat(String(raw || "").replace(/,/g, ""));
  return isFinite(n) ? n : null;
}

export function buildLabPanelOpinion(panel) {
  panel = normalizeLabPanel(panel);
  var notes = [];
  var warnN = 0;
  var alertN = 0;
  function add(level, text) {
    if (level === "alert") alertN += 1;
    else if (level === "warn") warnN += 1;
    notes.push({ level: level, text: text });
  }
  var glu = parseLabNumber(panel.values.fastingGlucose);
  if (glu != null) {
    if (glu >= 126) add("alert", "공복혈당 " + glu + " — 일반적인 건강 참고 구간보다 많이 높은 편이에요.");
    else if (glu >= 100) add("warn", "공복혈당 " + glu + " — 참고 평균보다 조금 높은 편이에요. 식단·체중과 함께 지켜볼 만합니다.");
    else if (glu < 70) add("warn", "공복혈당 " + glu + " — 다소 낮은 편으로 보여요. 어지럼·식은땀이 있으면 바로 확인하세요.");
    else notes.push({ level: "", text: "공복혈당 " + glu + " — 흔히 말하는 건강 참고 구간에 가까운 편이에요." });
  }
  var hba = parseLabNumber(panel.values.hba1c);
  if (hba != null) {
    if (hba >= 6.5) add("alert", "당화혈색소 " + hba + " — 참고 구간보다 높은 편이에요. 혈당 관리를 의사와 상의하는 게 좋아요.");
    else if (hba >= 5.7) add("warn", "당화혈색소 " + hba + " — 참고 평균보다 조금 높은 편이에요.");
    else notes.push({ level: "", text: "당화혈색소 " + hba + " — 참고 구간에 가까운 편이에요." });
  }
  var ldl = parseLabNumber(panel.values.ldl);
  if (ldl != null) {
    if (ldl >= 160) add("alert", "LDL " + ldl + " — 참고 구간보다 많이 높은 편이에요. 지질·심혈관 쪽은 의사와 확인하는 편이 안전합니다.");
    else if (ldl >= 100) add("warn", "LDL " + ldl + " — 참고 평균보다 높은 편이에요. 식단·약 안내는 의사·약사와 맞춰 보세요.");
    else notes.push({ level: "", text: "LDL " + ldl + " — 참고 구간에 가까운 편이에요." });
  }
  var hdl = parseLabNumber(panel.values.hdl);
  if (hdl != null) {
    if (hdl < 40) add("warn", "HDL " + hdl + " — 보호 쪽으로 알려진 수치가 다소 낮은 편이에요.");
    else notes.push({ level: "", text: "HDL " + hdl + " — 참고로 보기엔 나쁘지 않은 편이에요." });
  }
  var tg = parseLabNumber(panel.values.tg);
  if (tg != null) {
    if (tg >= 200) add("alert", "중성지방 " + tg + " — 참고 구간보다 많이 높은 편이에요.");
    else if (tg >= 150) add("warn", "중성지방 " + tg + " — 참고 평균보다 조금 높은 편이에요. 술·야식·단 음료를 줄이는 쪽이 도움이 될 수 있어요.");
    else notes.push({ level: "", text: "중성지방 " + tg + " — 참고 구간에 가까운 편이에요." });
  }
  var chol = parseLabNumber(panel.values.totalChol);
  if (chol != null) {
    if (chol >= 240) add("alert", "총콜레스테롤 " + chol + " — 참고 구간보다 높은 편이에요.");
    else if (chol >= 200) add("warn", "총콜레스테롤 " + chol + " — 참고 평균보다 조금 높은 편이에요.");
  }
  var uric = parseLabNumber(panel.values.uricAcid);
  if (uric != null) {
    if (uric >= 8.5) add("alert", "요산 " + uric + " — 참고 구간보다 많이 높은 편이에요. 통풍·관절 통증이 있으면 의사와 상의하세요.");
    else if (uric >= 7) add("warn", "요산 " + uric + " — 참고 평균보다 높은 편이에요. 내장·맥주·과당 음료를 줄이는 쪽을 참고해 보세요.");
    else notes.push({ level: "", text: "요산 " + uric + " — 참고 구간에 가까운 편이에요." });
  }
  var crea = parseLabNumber(panel.values.creatinine);
  if (crea != null) {
    if (crea >= 1.5) add("alert", "크레아티닌 " + crea + " — 참고 구간보다 높은 편이에요. 신장 쪽은 의사와 확인하는 게 좋아요.");
    else if (crea > 1.2) add("warn", "크레아티닌 " + crea + " — 참고 평균보다 조금 높은 편이에요.");
  }
  var egfr = parseLabNumber(panel.values.egfr);
  if (egfr != null) {
    if (egfr < 60) add("alert", "eGFR " + egfr + " — 참고로 보면 신장 기능 쪽을 의사와 상의하는 편이 안전합니다.");
    else if (egfr < 90) add("warn", "eGFR " + egfr + " — 참고 구간보다 다소 낮은 편이에요. 변화는 의사와 같이 보세요.");
    else notes.push({ level: "", text: "eGFR " + egfr + " — 참고 구간에 가까운 편이에요." });
  }
  var ast = parseLabNumber(panel.values.ast);
  var alt = parseLabNumber(panel.values.alt);
  if (ast != null && ast > 80) add("alert", "AST " + ast + " — 참고 구간보다 많이 높은 편이에요.");
  else if (ast != null && ast > 40) add("warn", "AST " + ast + " — 참고 평균보다 조금 높은 편이에요.");
  if (alt != null && alt > 80) add("alert", "ALT " + alt + " — 참고 구간보다 많이 높은 편이에요.");
  else if (alt != null && alt > 40) add("warn", "ALT " + alt + " — 참고 평균보다 조금 높은 편이에요.");
  var hb = parseLabNumber(panel.values.hemoglobin);
  if (hb != null) {
    if (hb < 11) add("alert", "혈색소 " + hb + " — 참고 구간보다 낮은 편이에요. 빈혈·피로가 있으면 의사와 상의하세요.");
    else if (hb < 12) add("warn", "혈색소 " + hb + " — 참고 평균보다 조금 낮은 편이에요.");
    else if (hb > 18) add("warn", "혈색소 " + hb + " — 참고 평균보다 높은 편이에요.");
    else notes.push({ level: "", text: "혈색소 " + hb + " — 참고 구간에 가까운 편이에요." });
  }

  var level = alertN ? "alert" : (warnN ? "warn" : "");
  var lines = [];
  if (!notes.length) {
    lines.push("아직 읽을 수 있는 숫자가 많지 않아요. 표를 더 읽거나 칸에 숫자를 보완해 주세요.");
  } else {
    notes.forEach(function (n) {
      if (n.level === "alert" || n.level === "warn") lines.push(n.text);
    });
    if (!lines.length) {
      lines.push("지금 들어온 숫자만 보면, 흔히 말하는 건강 참고 구간에서 크게 벗어나 보이지는 않아요.");
    }
    if (alertN) {
      lines.push("제 의견으로는 병원·의사와 한 번 확인해 보는 편이 좋겠습니다. (진단이 아니라 참고 의견입니다.)");
    } else if (warnN) {
      lines.push("당장 응급은 아니어 보여도, 수치가 신경 쓰이면 의사·약사에게 결과표를 보여 주세요.");
    } else {
      lines.push("생활 기록과 함께 지켜보시고, 다음에 같은 항목이 어떻게 변하는지만 비교해 보세요.");
    }
  }
  return {
    level: level,
    lines: lines,
    seeDoctor: alertN > 0 || warnN >= 2
  };
}

