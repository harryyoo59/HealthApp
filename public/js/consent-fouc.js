    /* 사전 동의 FOUC 방지 — 서비스용 템플릿(법무 확정본 아님) */
    (function () {
      var KEY = "healthapp.legalNoticeConsent.v1";
      var VERSION = 4;
      var ok = false;
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) {
          var data = JSON.parse(raw);
          ok = !!(data && data.agreed === true && Number(data.version) === VERSION);
        }
      } catch (e) {
        ok = false;
      }
      var gate = document.getElementById("consent-gate");
      if (ok) {
        if (gate) {
          gate.hidden = true;
          gate.setAttribute("aria-hidden", "true");
        }
      } else {
        document.body.classList.add("consent-pending");
        if (gate) {
          gate.hidden = false;
          gate.setAttribute("aria-hidden", "false");
        }
      }
    })();
