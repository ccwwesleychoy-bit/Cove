(() => {
  "use strict";

  const cfg = window.SHOP_CONFIG || {};
  const I18N = window.SHOP_I18N;
  function tt(key) {
    return I18N && I18N.t ? I18N.t(key) : key;
  }
  const currency = cfg.currencyLabel || "HK$";
  const freeAtAmount = Number(cfg.freeShippingAtAmount || 220);
  const shipFee = Number(cfg.shippingFee || 30);
  const packGramLabel = String(cfg.packGramLabel || "12g").trim();

  let catalog = Array.isArray(window.SHOP_CATALOG) ? window.SHOP_CATALOG : [];
  let products = [];
  let productsById = {};

  function setCatalog(items) {
    catalog = Array.isArray(items) ? items : [];
    products = catalog.filter((p) => p && p.enabled !== false);
    productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  }

  // Prefer `catalog.json` when available, so the site always reflects updates
  // from the GUI editor (which writes JSON). Falls back to `catalog.js`.
  async function loadCatalogPreferJson() {
    try {
      const v = String(window.__SHOP_V__ || Date.now());
      const res = await fetch(`catalog.json?v=${encodeURIComponent(v)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCatalog(data);
        return;
      }
    } catch (_) {
      // ignore
    }
    setCatalog(catalog);
  }

  const state = {
    cart: {}, // { [id]: qty }
    orderId: "",
    submitting: false,
    /** @type {null | { base64: string; mime: string; name: string; previewUrl: string }} */
    paymentProof: null,
  };

  function transferRemarkText() {
    if (I18N && I18N.getLang && I18N.getLang() === "zh-Hant" && I18N.tpl) {
      return I18N.tpl(tt("remarkTemplate"), { id: state.orderId });
    }
    return (
      (cfg.fpsNote || "Please put the Order ID in the transfer remark.") +
      "\n(Remark: " +
      state.orderId +
      ")"
    );
  }

  const $ = (id) => document.getElementById(id);

  /** 畫面顯示用；訂單 summary 仍用英文 p.name */
  function pickName(p) {
    if (I18N && I18N.getLang && I18N.getLang() === "zh-Hant") {
      const z = String(p.nameZh || "").trim();
      if (z) return z;
    }
    return String(p.name || "").trim();
  }

  function pickDesc(p) {
    if (I18N && I18N.getLang && I18N.getLang() === "zh-Hant") {
      const z = String(p.descriptionZh || "").trim();
      if (z) return z;
    }
    return String(p.description || "").trim();
  }

  function money(n) {
    return currency + Number(n || 0).toFixed(0);
  }

  function cartLines() {
    return Object.keys(state.cart)
      .map((id) => ({ product: productsById[id], qty: Number(state.cart[id] || 0) }))
      .filter((L) => L.product && L.qty > 0);
  }

  function unitCount() {
    return cartLines().reduce((s, L) => {
      const packs = Number(L.product.packs || cfg.unitPerQty || 10);
      return s + L.qty * packs;
    }, 0);
  }

  function subtotal() {
    return cartLines().reduce((s, L) => s + L.product.price * L.qty, 0);
  }

  function shipping(subtotalAmount) {
    return subtotalAmount >= freeAtAmount ? 0 : shipFee;
  }

  function total() {
    const sub = subtotal();
    return sub + shipping(sub);
  }

  function setQty(id, qty) {
    const q = Math.max(0, Math.min(99, parseInt(qty, 10) || 0));
    if (q === 0) delete state.cart[id];
    else state.cart[id] = q;
    renderCart();
    renderCartMobile();
    renderShopRows();
  }

  function bump(id, delta) {
    setQty(id, (state.cart[id] || 0) + delta);
  }

  function genOrderId() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const r = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "COVE-" + y + m + day + "-" + r;
  }

  /**
   * 結帳開著、背景半透明時：+ 要夠亮，但不可與左邊 − 用同一套樣式（否則兩格看起來都像減號格）。
   * #about / #contact 維持原本白底 +。
   */
  function invertQtyPlusForCheckoutOverlay() {
    if (!document.body.classList.contains("checkout-open")) return false;
    const h = String(location.hash || "").toLowerCase().trim();
    if (h === "#about" || h === "#contact") return false;
    return true;
  }

  function renderShopRows() {
    const root = $("shop-grid");
    if (!root) return;

    // Layout: 1 col mobile, 2 cols from sm+ (never 3 — reads calmer on desktop).

    const rows = products
      .map((p) => {
        const q = Number(state.cart[p.id] || 0);
        const incPlusContrast = invertQtyPlusForCheckoutOverlay();
        const incBtnClass = incPlusContrast
          ? "h-9 w-9 box-border border-2 border-[#c8c8c8] bg-[#1a1a1a] text-[#fafafa] text-[17px] font-medium leading-none hover:bg-[#252525] transition"
          : "h-9 w-9 border border-[#222] bg-[#ededed] text-[#0a0a0a] hover:bg-white transition";
        const img = String(p.imageUrl || "").trim();
        const media = img
          ? `
            <div class="aspect-[4/5] bg-[#141414] overflow-hidden relative">
              <img src="${escapeAttr(
                img
              )}" alt="" loading="lazy" class="h-full w-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition duration-700" onerror="this.parentElement.remove()" />
            </div>
          `
          : `
            <div class="aspect-[4/5] bg-[#141414] overflow-hidden relative grid place-items-center">
              <svg viewBox="0 0 40 40" class="h-10 w-10 text-ink-60" aria-hidden="true">
                <path d="M 28 10 A 12 12 0 1 0 28 30" stroke="currentColor" stroke-width="0.8" fill="none" stroke-linecap="round"/>
                <path d="M 24 17 A 4 4 0 1 0 24 23" stroke="currentColor" stroke-width="0.4" fill="none" stroke-linecap="round"/>
              </svg>
            </div>
          `;
        const inCartBadge = q > 0
          ? `<span class="absolute top-3 right-3 bg-ink-95 text-ink-10 text-[10px] tracking-[0.16em] uppercase px-2 py-1 font-medium">${q} ${escapeHtml(tt("inCart"))}</span>`
          : "";
        return `
          <article class="group cove-card border border-[#222] bg-[#111] relative">
            ${inCartBadge}
            ${media}
            <div class="p-6">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;font-size:20px;letter-spacing:0.06em;color:#ededed">${escapeHtml(
                    pickName(p)
                  )}</div>
                  <div class="mt-1.5 text-[11px] tracking-[0.16em] text-[#666]">${escapeHtml(
                    packGramLabel
                  )} · ${Number(p.packs || cfg.unitPerQty || 10)} ${escapeHtml(
                    tt("packsSuffix")
                  )}</div>
                  <div style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;font-size:15px;line-height:1.85;letter-spacing:0.02em;color:#9a9a9a;margin-top:10px;white-space:pre-line">${escapeHtml(
                    pickDesc(p)
                  )}</div>
                </div>
              </div>

              <div class="mt-6 pt-5 border-t border-[#222] flex items-center justify-between gap-4">
                <div>
                  <div style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:300;font-size:24px;line-height:1;letter-spacing:0.04em;color:#ededed;font-variant-numeric:lining-nums;font-feature-settings:'lnum' 1">${money(
                    p.price
                  )}</div>
                  ${q > 0 ? `<div class="mt-1.5 text-[11px] tracking-[0.14em] text-[#666]">${escapeHtml(tt("lineTotal"))} · ${money((p.price || 0) * q)}</div>` : ""}
                </div>
                <div class="flex items-center gap-0.5">
                  <button class="h-9 w-9 border border-[#2a2a2a] bg-[#0d0d0d] text-[#aaa] hover:text-[#ededed] hover:border-[#444] transition text-[16px] leading-none" data-act="dec" data-id="${escapeAttr(
                    p.id
                  )}" aria-label="Decrease">−</button>
                  <div class="w-8 text-center text-[13px] tracking-[0.06em] text-[#ededed] tabular-nums" style="font-family:'Cormorant Garamond',Georgia,serif;font-variant-numeric:lining-nums">${q}</div>
                  <button class="h-9 w-9 border border-[#2a2a2a] bg-[#0d0d0d] text-[#aaa] hover:text-[#ededed] hover:border-[#444] transition text-[16px] leading-none" data-act="inc" data-id="${escapeAttr(
                    p.id
                  )}" aria-label="Increase">+</button>
                </div>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    root.innerHTML = `
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        ${rows}
      </div>
    `;

    root.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const act = btn.getAttribute("data-act");
        if (!id) return;
        if (act === "inc") bump(id, 1);
        if (act === "dec") bump(id, -1);
      });
    });
  }

  function renderCart() {
    const lines = cartLines();
    const units = unitCount();
    const sub = subtotal();
    const ship = shipping(sub);
    const grand = sub + ship;

    if ($("cart-units")) $("cart-units").textContent = String(units);
    if ($("cart-subtotal")) $("cart-subtotal").textContent = money(sub);
    if ($("cart-shipping"))
      $("cart-shipping").textContent = ship === 0 ? tt("shipFree") : money(ship);
    if ($("cart-total")) $("cart-total").textContent = money(grand);
    if ($("cart-ship-rule"))
      $("cart-ship-rule").textContent =
        sub >= freeAtAmount
          ? tt("shipRuleFree")
          : I18N && I18N.tpl
            ? I18N.tpl(tt("shipRuleAt"), { amt: money(freeAtAmount) })
            : `Free shipping at ${money(freeAtAmount)}`;

    // Free-ship progress bar
    var progWrap = $("cart-progress");
    var progFill = $("cart-progress-fill");
    if (progWrap && progFill) {
      if (sub > 0 && sub < freeAtAmount) {
        var pct = Math.min(100, Math.round((sub / freeAtAmount) * 100));
        progFill.style.width = pct + "%";
        progWrap.hidden = false;
      } else {
        progWrap.hidden = true;
      }
    }

    const list = $("cart-lines");
    if (!list) return;
    if (lines.length === 0) {
      list.innerHTML = `
        <div class="py-10 text-center">
          <svg viewBox="0 0 40 40" class="mx-auto h-8 w-8 text-ink-60/70 mb-4" aria-hidden="true">
            <path d="M 28 10 A 12 12 0 1 0 28 30" stroke="currentColor" stroke-width="0.8" fill="none" stroke-linecap="round"/>
            <path d="M 24 17 A 4 4 0 1 0 24 23" stroke="currentColor" stroke-width="0.4" fill="none" stroke-linecap="round"/>
          </svg>
          <div class="text-[11px] tracking-[0.22em] uppercase text-ink-60">${escapeHtml(tt("cartEmpty"))}</div>
          <div class="mt-2 text-[11px] text-ink-60/70">${escapeHtml(tt("cartEmptyHint"))}</div>
        </div>`;
      if ($("btn-checkout")) $("btn-checkout").disabled = true;
      return;
    }
    if ($("btn-checkout")) $("btn-checkout").disabled = false;

    list.innerHTML = lines
      .map((L) => {
        return `
          <div class="flex items-start justify-between gap-3 py-3 border-b border-[#1a1a1a] last:border-b-0">
            <div class="min-w-0">
              <div class="truncate text-[12px] tracking-[0.14em] uppercase text-[#ededed]">${escapeHtml(
                pickName(L.product)
              )}</div>
              <div class="mt-1 text-[11px] text-[#777]">${money(
                L.product.price
              )} · x${L.qty}</div>
            </div>
            <div class="shrink-0 text-[12px] text-[#ededed] tabular-nums">${money(
              L.product.price * L.qty
            )}</div>
          </div>
        `;
      })
      .join("");
  }

  function renderCartMobile() {
    const bar = $("cart-mobile");
    if (!bar) return;
    const lines = cartLines();
    bar.hidden = lines.length === 0;
    if ($("cart-mobile-total")) $("cart-mobile-total").textContent = money(total());
    if ($("cart-mobile-units")) $("cart-mobile-units").textContent = String(unitCount());
  }

  function resetPaymentProof() {
    if (state.paymentProof && state.paymentProof.previewUrl) {
      try {
        URL.revokeObjectURL(state.paymentProof.previewUrl);
      } catch (_) {}
    }
    state.paymentProof = null;
    const input = $("payment-proof-input");
    if (input) input.value = "";
    const err = $("payment-proof-error");
    if (err) {
      err.textContent = "";
      err.classList.add("hidden");
    }
    const fnEl = $("payment-proof-filename");
    if (fnEl) {
      fnEl.textContent = "";
      fnEl.classList.add("hidden");
    }
    const wrap = $("payment-proof-preview-wrap");
    if (wrap) wrap.classList.add("hidden");
    const prev = $("payment-proof-preview");
    if (prev) {
      prev.removeAttribute("src");
    }
    const clr = $("btn-payment-proof-clear");
    if (clr) clr.classList.add("hidden");
  }

  function compressImageToJpegBlob(file, maxW, quality) {
    const mw = maxW == null ? 1680 : maxW;
    const q = quality == null ? 0.85 : quality;
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (!w || !h) {
          reject(new Error("image"));
          return;
        }
        if (w > mw) {
          h = Math.round((h * mw) / w);
          w = mw;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("blob"));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = String(reader.result || "");
              const i = dataUrl.indexOf(",");
              const base64 = i >= 0 ? dataUrl.slice(i + 1) : "";
              const baseName = String(file.name || "payment-proof").replace(/\.[^.]+$/, "") || "payment-proof";
              resolve({
                base64,
                mime: "image/jpeg",
                name: baseName + ".jpg",
                blob,
              });
            };
            reader.onerror = () => reject(new Error("read"));
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          q
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("load"));
      };
      img.src = url;
    });
  }

  function initPaymentProofUI() {
    const input = $("payment-proof-input");
    const btnPick = $("btn-payment-proof-pick");
    const btnClear = $("btn-payment-proof-clear");
    const err = $("payment-proof-error");
    const fnEl = $("payment-proof-filename");
    const wrap = $("payment-proof-preview-wrap");
    const prev = $("payment-proof-preview");

    function showProofErr(msg) {
      if (!err) return;
      err.textContent = msg || "";
      err.classList.toggle("hidden", !msg);
    }

    btnPick?.addEventListener("click", () => input?.click());

    btnClear?.addEventListener("click", () => {
      showProofErr("");
      resetPaymentProof();
    });

    input?.addEventListener("change", async () => {
      showProofErr("");
      const file = input.files && input.files[0];
      if (!file) return;
      const maxIn = 12 * 1024 * 1024;
      if (file.size > maxIn) {
        showProofErr(tt("errImageBig"));
        input.value = "";
        return;
      }
      try {
        const { base64, mime, name, blob } = await compressImageToJpegBlob(file);
        resetPaymentProof();
        input.value = "";
        const previewUrl = URL.createObjectURL(blob);
        state.paymentProof = { base64, mime, name, previewUrl };
        if (prev) prev.src = previewUrl;
        wrap?.classList.remove("hidden");
        btnClear?.classList.remove("hidden");
        if (fnEl) {
          fnEl.textContent = name;
          fnEl.classList.remove("hidden");
        }
      } catch {
        showProofErr(tt("errImageRead"));
        input.value = "";
      }
    });
  }

  function openCheckout() {
    if (cartLines().length === 0) return;
    resetPaymentProof();
    state.orderId = genOrderId();
    if ($("order-id-display")) $("order-id-display").textContent = state.orderId;
    if ($("remark-note")) $("remark-note").textContent = transferRemarkText();
    if ($("payme-link")) $("payme-link").href = cfg.payMeUrl || "#";
    if ($("fps-id")) $("fps-id").textContent = cfg.fpsId || "";
    const kpayUrl = String(cfg.kpayUrl || "").trim();
    const kpayWrap = $("kpay-link-wrap");
    const kpayLink = $("kpay-link");
    if (kpayWrap && kpayLink) {
      if (kpayUrl) {
        kpayLink.href = kpayUrl;
        kpayWrap.hidden = false;
      } else {
        kpayLink.removeAttribute("href");
        kpayWrap.hidden = true;
      }
    }
    renderPaymentFormHelp();
    if ($("order-id")) $("order-id").value = state.orderId;
    const summary = buildOrderSummary();
    if ($("order-summary")) $("order-summary").value = summary;
    if ($("order-summary-display"))
      $("order-summary-display").innerHTML = orderSummaryDisplayHtml(summary);
    const m = $("checkout");
    if (m) m.hidden = false;
    document.body.classList.add("checkout-open");
    renderShopRows();
    const nameField = $("field-name");
    if (nameField) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            nameField.focus({ preventScroll: true });
          } catch (_) {
            nameField.focus();
          }
        });
      });
    }
  }

  function closeCheckout() {
    const m = $("checkout");
    if (m) m.hidden = true;
    document.body.classList.remove("checkout-open");
    // Restore modal children (reverse success-state hide)
    const successEl = $("checkout-success");
    const form = $("form-order");
    if (form && successEl) {
      const modalBody = form.closest(".p-6");
      if (modalBody) {
        Array.from(modalBody.children).forEach((child) => {
          if (child === successEl) child.classList.add("hidden");
          else child.classList.remove("hidden");
        });
      }
    }
    // Reset submit button label
    const btn = $("btn-submit-order");
    if (btn) btn.textContent = tt("formSubmit");
    renderShopRows();
  }

  async function copyText(text) {
    const t = String(text || "").trim();
    if (!t) return false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(t);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function buildOrderSummary() {
    const isZh = I18N && I18N.getLang && I18N.getLang() === "zh-Hant";
    const lines = cartLines();
    const units = unitCount();
    const sub = subtotal();
    const ship = shipping(sub);
    const grand = sub + ship;
    let itemsBlock = "";
    for (const L of lines) {
      const dispName = isZh
        ? pickName(L.product)
        : String(L.product.name || "").trim();
      itemsBlock += `${dispName} × ${L.qty}  @ ${money(L.product.price)}  = ${money(
        L.product.price * L.qty
      )}\n`;
    }
    let t = "";
    if (isZh) {
      t += "訂單編號：" + state.orderId + "\n\n" + itemsBlock;
      t += `\n包數：${units}\n小計：${money(sub)}\n運費：${
        ship === 0 ? "免運" : money(ship)
      }\n合計：${money(grand)}\n`;
      t += hasKpayUrl() ? "\n付款：PayMe、轉數快 或 K Pay\n" : "\n付款：PayMe 或 轉數快\n";
      if (I18N && I18N.tpl) {
        t += I18N.tpl(tt("remarkTemplate"), { id: state.orderId }).trim() + "\n";
      } else {
        t += "請於轉帳備註填寫訂單編號。\n（備註：" + state.orderId + "）\n";
      }
    } else {
      t += "Order ID: " + state.orderId + "\n\n" + itemsBlock;
      t += `\nPacks: ${units}\nSubtotal: ${money(sub)}\nShipping: ${
        ship === 0 ? "Free" : money(ship)
      }\nTotal: ${money(grand)}\n`;
      t += hasKpayUrl() ? "\nPayment: PayMe, FPS, or K Pay\n" : "\nPayment: PayMe or FPS\n";
      t += (cfg.fpsNote || "Please put the Order ID in the transfer remark.") + "\n";
    }
    return t.trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function orderSummaryDisplayHtml(plain) {
    const fpsLine =
      cfg.fpsNote || "Please put the Order ID in the transfer remark.";
    const raw =
      I18N && I18N.translateSummaryDisplay
        ? I18N.translateSummaryDisplay(plain, fpsLine)
        : String(plain || "");
    return raw
      .split("\n")
      .map((line) => {
        if (/^(Total:|合計：)/.test(line)) {
          return '<strong class="font-bold text-ink-95">' + escapeHtml(line) + "</strong>";
        }
        return escapeHtml(line);
      })
      .join("\n");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function initNav() {
    // One-page layout: native anchor links only.
  }

  function initCheckout() {
    const openers = [$("btn-checkout"), $("btn-checkout-mobile")].filter(Boolean);
    openers.forEach((b) => b.addEventListener("click", openCheckout));
    if ($("btn-close-checkout"))
      $("btn-close-checkout").addEventListener("click", closeCheckout);
    if ($("btn-success-close"))
      $("btn-success-close").addEventListener("click", closeCheckout);
    if ($("checkout-backdrop"))
      $("checkout-backdrop").addEventListener("click", (e) => {
        if (e.target && e.target.id === "checkout-backdrop") closeCheckout();
      });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCheckout();
    });

    window.addEventListener("hashchange", () => {
      if (document.body.classList.contains("checkout-open")) renderShopRows();
    });

    const copyOrderBtn = $("btn-copy-order-id");
    if (copyOrderBtn) {
      copyOrderBtn.addEventListener("click", async () => {
        const ok = await copyText(state.orderId);
        copyOrderBtn.textContent = ok ? tt("chkCopied") : tt("chkCopy");
        if (ok) setTimeout(() => (copyOrderBtn.textContent = tt("chkCopy")), 900);
      });
    }

    const copyFpsBtn = $("btn-copy-fps");
    if (copyFpsBtn) {
      copyFpsBtn.addEventListener("click", async () => {
        const ok = await copyText(cfg.fpsId || "");
        copyFpsBtn.textContent = ok ? tt("chkCopied") : tt("chkCopy");
        if (ok) setTimeout(() => (copyFpsBtn.textContent = tt("chkCopy")), 900);
      });
    }

    initPaymentProofUI();

    const form = $("form-order");
    if (form) {
      form.addEventListener("submit", async (ev) => {
        const summary = buildOrderSummary();
        if ($("order-summary")) $("order-summary").value = summary;
        if ($("order-summary-display")) {
          $("order-summary-display").innerHTML = orderSummaryDisplayHtml(summary);
        }

        const endpoint = String(cfg.orderEndpoint || "").trim();
        if (!endpoint) return;

        ev.preventDefault();
        if (state.submitting) return;

        if (!state.paymentProof || !state.paymentProof.base64) {
          const pe = $("payment-proof-error");
          if (pe) {
            pe.textContent = tt("errNeedProof");
            pe.classList.remove("hidden");
            try {
              pe.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } catch (_) {}
          }
          return;
        }

        state.submitting = true;

        const btn = $("btn-submit-order");
        const oldBtnText = btn ? btn.textContent : "";
        if (btn) btn.textContent = tt("formSending");

        const phone = (form.querySelector('[name="phone"]') || {}).value || "";
        const email = (form.querySelector('[name="email"]') || {}).value || "";
        const payload = {
          orderId: state.orderId,
          createdAt: new Date().toISOString(),
          lang: I18N && I18N.getLang ? I18N.getLang() : "en",
          name: (form.querySelector('[name="name"]') || {}).value || "",
          phone,
          whatsapp: phone,
          address: (form.querySelector('[name="address"]') || {}).value || "",
          email,
          note: email,
          summary,
          paymentProofBase64: state.paymentProof.base64,
          paymentProofMime: state.paymentProof.mime,
          paymentProofFileName: state.paymentProof.name,
        };

        try {
          // Apps Script Web App doesn't reliably support CORS.
          // Use no-cors so the POST can still reach the script (response is opaque).
          await fetch(endpoint, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
          });
          if (btn) btn.textContent = tt("formSent");
          // Show success state
          const successEl = $("checkout-success");
          const successOrderId = $("success-order-id");
          if (successOrderId) successOrderId.textContent = state.orderId;
          // Hide the form + summary + payment row, show success
          const hideSelectors = ["#order-summary-display", "#form-order"];
          const modalBody = form.closest(".p-6");
          if (modalBody && successEl) {
            Array.from(modalBody.children).forEach((child) => {
              if (child !== successEl) child.classList.add("hidden");
            });
            successEl.classList.remove("hidden");
          }
          state.cart = {};
          renderShopRows();
          renderCart();
          renderCartMobile();
        } catch (e) {
          console.error("Order submit failed:", e);
          if (btn) btn.textContent = tt("formFailed");
          setTimeout(() => {
            if (btn) btn.textContent = oldBtnText || tt("formSubmit");
          }, 1200);
        } finally {
          state.submitting = false;
        }
      });
    }
  }

  function fillDisclaimerEl(el, raw) {
    if (!el) return;
    el.replaceChildren();
    const parts = String(raw || "")
      .split(/\n\s*\n/)
      .map((s) => s.trim().replace(/\s+/g, " "))
      .filter(Boolean);
    for (const para of parts) {
      const p = document.createElement("p");
      p.textContent = para;
      el.appendChild(p);
    }
  }

  function renderDisclaimer() {
    const raw =
      I18N && I18N.disclaimerForLang ? I18N.disclaimerForLang() : cfg.disclaimerNote;
    fillDisclaimerEl($("footer-disclaimer"), raw);
    fillDisclaimerEl($("checkout-disclaimer"), raw);
  }

  function hasKpayUrl() {
    return Boolean(String(cfg.kpayUrl || "").trim());
  }

  function renderPaymentFormHelp() {
    const el = $("form-pay-help");
    if (!el) return;
    const html = tt(hasKpayUrl() ? "formPayHelpWithKpay" : "formPayHelp");
    el.innerHTML = html;
  }

  function contactPhoneDisplay(raw) {
    const d = String(raw || "").replace(/\D/g, "");
    if (d.length === 8) return d.slice(0, 4) + " " + d.slice(4);
    return String(raw || "").trim();
  }

  /** 聯絡文案在 index.html 內中英各一區，依 data-cove-lang 用 CSS 切換；此處只同步 config 電話／電郵 */
  function renderContactInfo() {
    const phone = contactPhoneDisplay(cfg.contactPhone) || "—";
    const email = String(cfg.contactEmail || "").trim();
    const phoneZh = $("contact-phone-display-zh");
    const phoneEn = $("contact-phone-display-en");
    if (phoneZh) phoneZh.textContent = phone;
    if (phoneEn) phoneEn.textContent = phone;
    const linkZh = $("contact-email-link-zh");
    const linkEn = $("contact-email-link-en");
    [linkZh, linkEn].forEach((a) => {
      if (!a) return;
      if (email) {
        a.href = "mailto:" + email;
        a.textContent = email;
      } else {
        a.removeAttribute("href");
        a.textContent = "";
      }
    });
  }

  async function boot() {
    renderContactInfo();
    renderPaymentFormHelp();
    await loadCatalogPreferJson();
    renderDisclaimer();
    renderContactInfo();
    renderPaymentFormHelp();
    renderShopRows();
    renderCart();
    renderCartMobile();
    initCheckout();
    const clearBtn = $("btn-clear");
    if (clearBtn) clearBtn.addEventListener("click", () => {
      state.cart = {};
      renderShopRows();
      renderCart();
      renderCartMobile();
    });
  }

  // 須在 boot 的 await 之前註冊：否則使用者在 catalog 載入前切換「中／EN」會錯過事件，
  // 導覽等已由 i18n 更新，但 #contact-body 仍停留在 index 內的英文備援。
  window.addEventListener("cove-lang-change", () => {
    if (I18N && I18N.applyToDocument) I18N.applyToDocument();
    renderDisclaimer();
    renderPaymentFormHelp();
    renderContactInfo();
    renderShopRows();
    renderCart();
    renderCartMobile();
    if (document.body.classList.contains("checkout-open") && state.orderId) {
      if ($("remark-note")) $("remark-note").textContent = transferRemarkText();
      const summary = buildOrderSummary();
      if ($("order-summary")) $("order-summary").value = summary;
      if ($("order-summary-display"))
        $("order-summary-display").innerHTML = orderSummaryDisplayHtml(summary);
    }
  });

  // catalog 載入前就先寫入聯絡電話／電郵，避免 await 期間電話欄空白
  renderContactInfo();
  renderPaymentFormHelp();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => void boot());
  } else {
    void boot();
  }
})();