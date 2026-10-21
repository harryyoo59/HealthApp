    (function () {
      var banner = document.getElementById("app-update-banner");
      var noticeKey = "healthapp.shellUpdateNotice.v1";
      function markUpdateButtonsReady() {
        [
          document.getElementById("app-shell-update-top"),
          document.getElementById("app-shell-refresh")
        ].forEach(function (btn) {
          if (!btn) return;
          btn.classList.add("is-update-ready");
          btn.setAttribute("aria-label", "업데이트 · 새 화면이 있습니다");
        });
      }
      function showUpdateNotice() {
        try {
          if (sessionStorage.getItem(noticeKey) === "1") {
            markUpdateButtonsReady();
            return;
          }
          sessionStorage.setItem(noticeKey, "1");
        } catch (e) { /* ignore */ }
        markUpdateButtonsReady();
        if (!banner) return;
        banner.textContent = "업데이트를 누르세요";
        banner.hidden = false;
      }
      try {
        if (sessionStorage.getItem(noticeKey) === "1") markUpdateButtonsReady();
      } catch (eReady) { /* ignore */ }
      if (banner) {
        banner.addEventListener("click", function () {
          var updateBtn = document.getElementById("app-shell-update-top")
            || document.getElementById("app-shell-refresh");
          if (updateBtn) {
            updateBtn.click();
            return;
          }
          banner.hidden = true;
        });
      }
      window.addEventListener("healthapp-shell-update", showUpdateNotice);

      function standaloneApp() {
        var media = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
        return !!media || window.navigator.standalone === true;
      }

      if (!("serviceWorker" in navigator)) return;
      var hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController) {
          hadController = true;
          return;
        }
        if (!standaloneApp()) {
          try {
            if (sessionStorage.getItem("healthapp.shellAutoReload.v1") === "1") {
              showUpdateNotice();
              return;
            }
            sessionStorage.setItem("healthapp.shellAutoReload.v1", "1");
            sessionStorage.setItem("healthapp.shellRefreshHint.v1", "1");
          } catch (eReload) { /* ignore */ }
          window.location.reload();
          return;
        }
        showUpdateNotice();
      });
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/sw.js", { scope: "/" }).then(function (reg) {
          document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === "visible" && reg && reg.update) reg.update();
          });
        }).catch(function () {});
      });
    })();
