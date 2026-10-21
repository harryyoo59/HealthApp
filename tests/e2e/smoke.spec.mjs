import { test, expect } from "@playwright/test";

test.describe("홈 스모크", () => {
  test("홈이 로드되고 시트를 연다", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "healthapp.legalNoticeConsent.v1",
          JSON.stringify({ agreed: true, version: 4, at: Date.now() })
        );
      } catch (e) { /* ignore */ }
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "알고 먹는 내몸 지키기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "어제 먹은 음식 입력" })).toBeVisible();

    await page.getByRole("button", { name: "어제 먹은 음식 입력" }).click();
    await expect(page.getByRole("heading", { name: "어제 먹은 음식" })).toBeVisible();
    await expect(page.getByRole("button", { name: "저장" })).toBeVisible();

    await page.getByRole("button", { name: "닫기" }).click();
    await expect(page.getByRole("button", { name: "어제 먹은 음식 입력" })).toBeVisible();
  });

  test("처방·검사 시트가 열린다", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "healthapp.legalNoticeConsent.v1",
          JSON.stringify({ agreed: true, version: 4, at: Date.now() })
        );
      } catch (e) { /* ignore */ }
    });

    await page.goto("/");
    await page.getByRole("button", { name: "처방및 병명 입력" }).click();
    await expect(page.getByRole("heading", { name: "처방및 병명" })).toBeVisible();
    await expect(page.getByText("검사 결과표 사진")).toBeVisible();
  });
});
