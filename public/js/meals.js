/** 식단 칸·정규화 (순수 로직) */
export const MEAL_FIELDS = {
  breakfast: {
    title: "아침",
    help: "어제 아침에 먹은 음식을 적어 주세요. 예: 밥, 계란후라이, 김치"
  },
  lunch: {
    title: "점심",
    help: "어제 점심에 먹은 음식을 적어 주세요. 예: 비빔밥, 된장국"
  },
  dinner: {
    title: "저녁",
    help: "어제 저녁에 먹은 음식을 적어 주세요. 예: 삼겹살, 쌈채소"
  },
  lateNight: {
    title: "야식",
    help: "어제 먹은 야식을 적어 주세요. 예: 떡볶이, 라면"
  },
  drink: {
    title: "음료",
    help: "어제 마신 음료를 적어 주세요. 예: 아메리카노(노슈가), 커피(일반)"
  },
  alcohol: {
    title: "주류",
    help: "어제 마신 술을 적어 주세요. 예: 소주, 맥주"
  },
  dessert: {
    title: "간식/디저트",
    help: "어제 먹은 간식·디저트를 적어 주세요. 예: 과자, 아이스크림"
  }
};

export function emptyMeals() {
  return { breakfast: "", lunch: "", dinner: "", lateNight: "", drink: "", alcohol: "", dessert: "" };
}

export function normalizeMealsObject(raw) {
  var out = emptyMeals();
  if (!raw || typeof raw !== "object") return out;
  Object.keys(out).forEach(function (key) {
    out[key] = String(raw[key] || "");
  });
  var legacySnack = String(raw.snack || "").trim();
  if (legacySnack && !String(out.dessert || "").trim()) {
    out.dessert = String(raw.snack || "");
  }
  return out;
}

export function emptyMealSlotDraft() {
  return { chips: [], note: "" };
}

export function emptyMealDraft() {
  return {
    breakfast: emptyMealSlotDraft(),
    lunch: emptyMealSlotDraft(),
    dinner: emptyMealSlotDraft(),
    lateNight: emptyMealSlotDraft(),
    drink: emptyMealSlotDraft(),
    alcohol: emptyMealSlotDraft(),
    dessert: emptyMealSlotDraft()
  };
}

