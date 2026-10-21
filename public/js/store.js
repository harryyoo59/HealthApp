/** 공용 저장소 — state / keys / persist / load·save */
export const STORAGE_KEY = "healthapp.bodyBasics.v1";
export const MEALS_KEY = "healthapp.yesterdayMeals.v1";
export const ACTIVITIES_KEY = "healthapp.yesterdayActivities.v1";
export const WALK_KEY = "healthapp.yesterdayWalk.v1";
export const DAILY_KEY = "healthapp.dailyLog.v1";
export const META_KEY = "healthapp.dayMeta.v1";
export const MEMBERS_KEY = "healthapp.members.v1";
export const SYMPTOM_ASK_KEY = "healthapp.symptomAsk.v1";
export const FIXED_MENU_KEY = "healthapp.fixedMenu.v1";
export const CUSTOM_EXTRA_KINDS_KEY = "healthapp.customExtraKinds.v1";
export const CHIP_LABEL_CACHE_KEY = "healthapp.chipLabelCache.v1";
export const FOOD_WAREHOUSE_KEY = "healthapp.foodWarehouse.v1";
export const SUPPRESSED_DEFAULT_BY_MEAL_KEY = "healthapp.suppressedDefaultFoodChipsByMeal.v1";
export const LEGACY_HIDDEN_DEFAULT_CHIPS_KEY = "healthapp.hiddenDefaultFoodChips.v1";
export const LEGACY_SUPPRESSED_DEFAULT_CHIP_IDS_KEY = "healthapp.suppressedDefaultFoodChipIds.v1";
export const CONSENT_KEY = "healthapp.legalNoticeConsent.v1";
export const CONSENT_VERSION = 4;
export const AUTO_BACKUP_KEY = "healthapp.autoBackup.v1";
export const PRE_IMPORT_BACKUP_KEY = "healthapp.preImportBackup.v1";
export const Q_WEEKLY_REMIND_KEY = "healthapp.qWeeklyRemind.v1";
export const Q_WEEKLY_REMIND_WEEKDAY = 0;
export const Q_WEEKLY_REMIND_MSG = "기존에 입력하신 문진 내용이 변화가 있으면 수정 부탁 합니다";
export const Q_COMEBACK_REMIND_MSG = "문진 내용을 다시 입력하여 주시기 바랍니다";
export const Q_COMEBACK_GAP_DAYS = 7;
export const VITALS_PREFS_KEY = "healthapp.vitalsPrefs.v1";
export const VITALS_LOG_KEY = "healthapp.vitalsLog.v1";
export const LAB_PHOTOS_META_KEY = "healthapp.labPhotosMeta.v1";
export const LAB_PHOTOS_DB_NAME = "healthappLabPhotos";
export const LAB_PHOTOS_STORE = "photos";
export const LAB_PHOTOS_MAX = 20;
export const BACKUP_DB_NAME = "healthappBackup";
export const BACKUP_STORE = "snapshots";
export const BACKUP_ID = "latest";

export const PERSIST_KEYS = [
  STORAGE_KEY, MEALS_KEY, ACTIVITIES_KEY, WALK_KEY, DAILY_KEY, META_KEY, MEMBERS_KEY, SYMPTOM_ASK_KEY,
  FIXED_MENU_KEY, CUSTOM_EXTRA_KINDS_KEY, CHIP_LABEL_CACHE_KEY, FOOD_WAREHOUSE_KEY, SUPPRESSED_DEFAULT_BY_MEAL_KEY,
  VITALS_PREFS_KEY, VITALS_LOG_KEY
];

export function createEmptyBodyState() {
  return {
    sex: "", birthDate: "", age: "", height: "", weight: "", bp: "",
    rx: "", dx: "", otc: "", supp: "", labs: "", labsMemo: "", labPanels: [],
    surgery: "", cured: "",
    questionnaire: null
  };
}

export const store = {
  state: createEmptyBodyState()
};

export function getState() {
  return store.state;
}

export function setState(next) {
  store.state = next;
  return store.state;
}

var persistFailHandler = null;
var normalizeBodyBasicsFn = function (raw) { return raw || createEmptyBodyState(); };
var afterSaveFn = null;

export function configureStore(opts) {
  opts = opts || {};
  if (typeof opts.normalizeBodyBasics === "function") normalizeBodyBasicsFn = opts.normalizeBodyBasics;
  if (typeof opts.afterSave === "function") afterSaveFn = opts.afterSave;
  if (typeof opts.onPersistFail === "function") persistFailHandler = opts.onPersistFail;
}

export function persistSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (persistFailHandler) persistFailHandler(e);
    return false;
  }
}

export function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeBodyBasicsFn({});
    var parsed = JSON.parse(raw);
    return normalizeBodyBasicsFn(parsed);
  } catch (e) {
    return normalizeBodyBasicsFn({});
  }
}

export function saveState() {
  if (!persistSetItem(STORAGE_KEY, JSON.stringify(store.state))) return;
  if (afterSaveFn) afterSaveFn();
}
