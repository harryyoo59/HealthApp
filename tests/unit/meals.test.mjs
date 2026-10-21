import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MEAL_FIELDS,
  emptyMeals,
  normalizeMealsObject,
  emptyMealDraft
} from "../../public/js/meals.js";

describe("meals 정규화", () => {
  it("MEAL_FIELDS에 끼니가 있다", () => {
    assert.ok(MEAL_FIELDS.breakfast);
    assert.ok(MEAL_FIELDS.dessert);
    assert.equal(Object.keys(MEAL_FIELDS).length, 7);
  });

  it("emptyMeals는 빈 문자열 칸이다", () => {
    const m = emptyMeals();
    assert.equal(m.breakfast, "");
    assert.equal(m.lunch, "");
  });

  it("normalizeMealsObject가 예전 snack을 dessert로 옮긴다", () => {
    const m = normalizeMealsObject({ breakfast: "죽", snack: "과자" });
    assert.equal(m.breakfast, "죽");
    assert.equal(m.dessert, "과자");
  });

  it("emptyMealDraft가 끼니별 chips·note를 만든다", () => {
    const d = emptyMealDraft();
    assert.deepEqual(d.breakfast.chips, []);
    assert.equal(d.dinner.note, "");
  });
});
