# 알고 먹는 내몸 지키기

폰·브라우저에서 쓰는 개인 건강 일지(웹/PWA)입니다. 기록은 그 기기에만 저장됩니다.

## 공개 주소

- **사이트:** dailybodydiary.com
- **HTTPS:** https://dailybodydiary.com/

## 로컬 개발

`npm run dev` 는 개발할 때만 씁니다. 이 컴퓨터에서만 http://127.0.0.1:43127/ 이 열립니다. 같은 Wi-Fi 폰에서 미리볼 때만 `npm run dev:lan` 을 씁니다.

## 배포

GitHub `main` 푸시 → Vercel `healthapp` 자동 배포 (출력 폴더 `public`). 공개 도메인은 dailybodydiary.com 입니다.
