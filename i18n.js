/**
 * Covey 中英切換（繁體中文 UI；商品名稱沿用 catalog 英文）
 * localStorage key: cove-lang → "en" | "zh-Hant"
 */
(function () {
  "use strict";

  var STORAGE_KEY = "cove-lang";

  var STR = {
    en: {
      siteTitle: "Covey",
      navShop: "Shop",
      navAbout: "About",
      navContact: "Contact",
      langBtn: "中",
      heroKicker: "Coffee Drip Bag",
      heroTag1: "Simple brew",
      heroTag2: "Easy enjoy",
      heroCta: "Shop Collection",
      heroScroll: "Scroll ↓",
      featShipTitle: "Free Shipping",
      featShipSub: "Orders over HK$240",
      featFreshTitle: "Freshly Roasted",
      featFreshSub: "Packed within 5 days of roasting",
      featPayTitle: "Secure Payment",
      featPaySub: "PayMe · FPS",
      featOriginTitle: "Single Origin",
      featOriginSub: "New lots often",
      brewTitle: "How to Brew",
      brewStep1Title: "888 Balanced",
      brewStep1Lead: "Clean, balanced, classic",
      brewStep1Desc: "Pour in three even rounds to 80% fill, waiting between each for the water to draw through. Each pause lets the coffee develop and clarify. Produces a clean, balanced cup with sweetness and definition.",
      brewStep2Title: "Steep & Filter",
      brewStep2Lead: "Full-bodied, immersive",
      brewStep2Desc: "Immersion-style brewing. Tip the grounds into your cup, pour in hot water to the recommended weight, and stir gently. Steep for about two minutes, then pass the liquid back through the empty bag as a filter. Rounder mouthfeel, richer body.",
      brewStep3Title: "Quick Brew",
      brewStep3Lead: "Simplest, light-bodied",
      brewStep3Desc: "The everyday method. Set the bag over your cup and fill with hot water. As the level drops, top it up again; continue until you've used 180–200g of water in total. Let the final pour drain fully before lifting the bag. Light, smooth, unfussy.",
      brewNote: "Water 180–200g · Temperature 90–95°C",
      inCart: "in cart",
      lineTotal: "Line",
      cartEmptyHint: "Add a drip bag to begin",
      footerTagline: "Good coffee, simply done.",
      footerExplore: "Explore",
      footerRights: "All rights reserved",
      formTrust: "Secure · Encrypted · No card stored",
      successTitle: "Thank you",
      successSub: "Your order is received",
      successBody: "We'll confirm your order by WhatsApp or email shortly. Pour slow, sip slow.",
      successClose: "Close",
      shopLabel: "Shop",
      shopTitle: "Drip Bag Set",
      cartTitle: "Cart",
      cartClear: "Clear",
      cartPacks: "Packs",
      cartSubtotal: "Subtotal",
      cartShipping: "Shipping",
      cartTotal: "Total",
      cartCheckout: "Checkout",
      cartEmpty: "Empty",
      shipFree: "Free",
      shipRuleFree: "Free shipping applied",
      shipRuleAt: "Free shipping at {{amt}}",
      mobilePacks: "Packs",
      aboutTitle: "About COVEY",
      about1: "COVEY only does one thing: make good coffee simple.",
      about2: "We select quality single origin beans and turn them into convenient drip bags.",
      about3: "So you can enjoy a good cup of coffee anywhere, anytime.",
      about4: "Simple. Pure. COVEY.",
      contactTitle: "Contact",
      footerSales: "Sales policy",
      chkTitle: "Checkout",
      chkClose: "Close",
      chkOrderSummary: "Order Summary",
      chkOrder: "Order",
      chkCopy: "Copy",
      chkCopied: "Copied",
      chkPayMe: "PayMe",
      chkFps: "FPS",
      chkKPay: "K Pay",
      formName: "Name",
      formPhone: "Phone / WhatsApp",
      formAddress: "Address",
      formEmail:
        "Email (Optional) (Prefer email confirmation over WhatsApp)",
      formPayCap: "Payment screenshot",
      formPayHelp:
        "Upload a <strong class=\"font-medium text-ink-95\">screen capture / photo</strong> of your completed PayMe or FPS (showing amount and time). Required — orders without this image cannot be submitted.",
      formPayHelpWithKpay:
        "Upload a <strong class=\"font-medium text-ink-95\">screen capture / photo</strong> of your completed PayMe, FPS, or K Pay (showing amount and time). Required — orders without this image cannot be submitted.",
      formChooseImg: "Choose image",
      formRemove: "Remove",
      formPreview: "Preview",
      formSubmit: "Submit",
      formSending: "Sending...",
      formSent: "Sent",
      formFailed: "Failed — Try again",
      errImageBig: "Image must be under 12 MB.",
      errImageRead:
        "Could not read this image. Use a JPG, PNG, or WebP screen capture / photo.",
      errNeedProof:
        "Please upload your transfer screen capture / photo before submitting.",
      packsSuffix: "packs",
      remarkTemplate:
        "Please put the Order ID in the transfer remark.\n(Remark: {{id}})",
      disclaimer:
        "All sales are final once shipped.\n\n" +
        "As drip bags contain fresh roasted coffee, returns and refunds are not accepted except in cases of manufacturing defects or damage during delivery.\n\n" +
        "We appreciate your understanding.",
    },
    "zh-Hant": {
      siteTitle: "Covey",
      navShop: "商店",
      navAbout: "關於",
      navContact: "聯絡",
      langBtn: "EN",
      heroKicker: "咖啡掛耳包",
      heroTag1: "簡單沖煮",
      heroTag2: "輕鬆享受",
      heroCta: "立即選購",
      heroScroll: "向下瀏覽 ↓",
      featShipTitle: "免運費",
      featShipSub: "滿 HK$240 免運",
      featFreshTitle: "新鮮烘焙",
      featFreshSub: "烘焙後 5 天內包裝",
      featPayTitle: "安全付款",
      featPaySub: "PayMe · 轉數快",
      featOriginTitle: "單一產區",
      featOriginSub: "定期更換產品",
      brewTitle: "沖泡方法",
      brewStep1Title: "888 平衡沖法",
      brewStep1Lead: "乾淨・平衡・經典",
      brewStep1Desc: "分三次注入熱水，每次約八成滿，等水位自然下降後再續注。每次停頓讓咖啡充分釋放並澄清。帶出平衡、乾淨且帶甜感的層次。",
      brewStep2Title: "浸泡過濾法",
      brewStep2Lead: "口感飽滿・沉浸式萃取",
      brewStep2Desc: "浸泡萃取式。將咖啡粉倒入杯中，依建議水量注入熱水並輕輕攪拌，浸泡約 2 分鐘，再將咖啡液倒回濾袋過濾。口感圓潤飽滿，層次豐富。",
      brewStep3Title: "快速沖泡法",
      brewStep3Lead: "簡單・輕盈",
      brewStep3Desc: "日常最簡單的沖法。將濾袋架於杯口，注滿熱水；水位下降時再補水，直到總量達 180–200g。等待最後一次完全流完再取下濾袋。口感輕盈、清爽、不費心。",
      brewNote: "建議水量 180–200g · 水溫 90–95°C",
      inCart: "已加入",
      lineTotal: "小計",
      cartEmptyHint: "選一款掛耳包開始",
      footerTagline: "好咖啡，不複雜。",
      footerExplore: "瀏覽",
      footerRights: "版權所有",
      formTrust: "安全 · 加密 · 不儲存卡號",
      successTitle: "謝謝你",
      successSub: "訂單已收到",
      successBody: "我們會以 WhatsApp 或電郵盡快確認訂單。慢慢沖，慢慢品。",
      successClose: "關閉",
      shopLabel: "商店",
      shopTitle: "掛耳包組合",
      cartTitle: "購物車",
      cartClear: "清空",
      cartPacks: "包數",
      cartSubtotal: "小計",
      cartShipping: "運費",
      cartTotal: "合計",
      cartCheckout: "結帳",
      cartEmpty: "尚無商品",
      shipFree: "免運",
      shipRuleFree: "已享免運費",
      shipRuleAt: "滿 {{amt}} 免運費",
      mobilePacks: "包數",
      aboutTitle: "關於 COVEY",
      about1: "COVEY 只做一件事：讓好咖啡變得簡單。",
      about2: "我們挑選優質單一產區咖啡豆，製成方便的掛耳包。",
      about3: "讓你在任何地方，都能輕鬆享受一杯好咖啡。",
      about4: "簡單。純粹。COVEY。",
      contactTitle: "聯絡",
      footerSales: "銷售條款",
      chkTitle: "結帳",
      chkClose: "關閉",
      chkOrderSummary: "訂單摘要",
      chkOrder: "訂單",
      chkCopy: "複製",
      chkCopied: "已複製",
      chkPayMe: "PayMe",
      chkFps: "轉數快 FPS",
      chkKPay: "K Pay",
      formName: "姓名",
      formPhone: "電話 / WhatsApp",
      formAddress: "地址",
      formEmail: "電郵（選填，如需以電郵確認請填）",
      formPayCap: "付款截圖",
      formPayHelp:
        "請上傳 PayMe 或轉數快完成畫面的<strong class=\"font-medium text-ink-95\">截圖或相片</strong>（需顯示金額與時間）。未附圖將無法提交訂單。",
      formPayHelpWithKpay:
        "請上傳 PayMe、轉數快或 K Pay 完成畫面的<strong class=\"font-medium text-ink-95\">截圖或相片</strong>（需顯示金額與時間）。未附圖將無法提交訂單。",
      formChooseImg: "選擇圖片",
      formRemove: "移除",
      formPreview: "預覽",
      formSubmit: "提交訂單",
      formSending: "傳送中…",
      formSent: "已送出",
      formFailed: "失敗 — 請重試",
      errImageBig: "圖片須小於 12 MB。",
      errImageRead: "無法讀取此圖片，請使用 JPG、PNG 或 WebP 截圖或相片。",
      errNeedProof: "提交前請先上傳轉帳截圖或相片。",
      packsSuffix: "包",
      remarkTemplate: "請於轉帳備註填寫訂單編號。\n（備註：{{id}}）",
      /** 訂單摘要預覽：對應 config.js 預設英文 fpsNote 那一行 */
      fpsNoteSummaryZh: "請於轉帳備註填寫訂單編號。",
      disclaimer:
        "貨品寄出後，恕不接受退款或退換。\n\n" +
        "掛耳包內為新鮮烘焙咖啡，除製造瑕疵或運送損毀外，恕不接受退貨退款。\n\n" +
        "感謝你的理解。",
    },
  };

  function getLang() {
    try {
      var s = (localStorage.getItem(STORAGE_KEY) || "").trim();
      return s === "zh-Hant" ? "zh-Hant" : "en";
    } catch (_) {
      return "en";
    }
  }

  function setLang(lang) {
    var L = lang === "zh-Hant" ? "zh-Hant" : "en";
    try {
      localStorage.setItem(STORAGE_KEY, L);
    } catch (_) {}
    applyToDocument();
    try {
      window.dispatchEvent(new CustomEvent("cove-lang-change", { detail: { lang: L } }));
    } catch (_) {}
  }

  function t(key) {
    var L = getLang();
    var pack = STR[L] || STR.en;
    if (Object.prototype.hasOwnProperty.call(pack, key)) return pack[key];
    return STR.en[key] != null ? STR.en[key] : key;
  }

  function tpl(str, vars) {
    var out = String(str || "");
    if (!vars) return out;
    Object.keys(vars).forEach(function (k) {
      out = out.split("{{" + k + "}}").join(String(vars[k] != null ? vars[k] : ""));
    });
    return out;
  }

  /** 僅供畫面顯示；送出後台仍用英文 summary */
  function translateSummaryDisplay(plain, fpsNoteEnglish) {
    if (getLang() !== "zh-Hant") return String(plain || "");
    var s = String(plain || "");
    var map = [
      [/^Order ID:\s*/gm, "訂單編號："],
      [/^Packs:\s*/gm, "包數："],
      [/^Subtotal:\s*/gm, "小計："],
      [/^Shipping:\s*Free\s*$/gm, "運費：免運"],
      [/^Shipping:\s*/gm, "運費："],
      [/^Total:\s*/gm, "合計："],
      [/^Payment:\s*PayMe or FPS\s*$/gm, "付款：PayMe 或 轉數快"],
      [/^Payment:\s*PayMe, FPS, or K Pay\s*$/gm, "付款：PayMe、轉數快 或 K Pay"],
      [/^Payment:\s*/gm, "付款："],
    ];
    map.forEach(function (pair) {
      s = s.replace(pair[0], pair[1]);
    });
    var noteEn = String(
      fpsNoteEnglish != null ? fpsNoteEnglish : "Please put the Order ID in the transfer remark."
    ).trim();
    var zhPack = STR["zh-Hant"];
    var noteZh =
      zhPack && zhPack.fpsNoteSummaryZh
        ? zhPack.fpsNoteSummaryZh
        : "請於轉帳備註填寫訂單編號。";
    if (noteEn) {
      s = s.split(noteEn).join(noteZh);
    }
    return s;
  }

  function applyToDocument() {
    var L = getLang();
    document.documentElement.lang = L === "zh-Hant" ? "zh-Hant" : "en";
    document.documentElement.setAttribute("data-cove-lang", L);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var val = t(key);
      if (el.tagName === "TITLE") {
        document.title = val;
        return;
      }
      if (el.hasAttribute("data-i18n-html")) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    var btn = document.getElementById("btn-lang");
    if (btn) {
      btn.textContent = L === "zh-Hant" ? "EN" : "中";
      btn.setAttribute("aria-label", L === "zh-Hant" ? "Switch to English" : "切換為繁體中文");
      btn.setAttribute(
        "title",
        L === "zh-Hant"
          ? "切換為英文介面"
          : "繁體中文請按此鈕，勿使用 Chrome／Edge「翻譯網頁」——會把 COVEY 等字誤譯、版面變怪。"
      );
    }
  }

  window.SHOP_I18N = {
    getLang: getLang,
    setLang: setLang,
    t: t,
    tpl: tpl,
    applyToDocument: applyToDocument,
    translateSummaryDisplay: translateSummaryDisplay,
    disclaimerForLang: function () {
      return t("disclaimer");
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyToDocument();
      var b = document.getElementById("btn-lang");
      if (b) {
        b.addEventListener("click", function () {
          setLang(getLang() === "zh-Hant" ? "en" : "zh-Hant");
        });
      }
    });
  } else {
    applyToDocument();
    var b2 = document.getElementById("btn-lang");
    if (b2) {
      b2.addEventListener("click", function () {
        setLang(getLang() === "zh-Hant" ? "en" : "zh-Hant");
      });
    }
  }
})();
