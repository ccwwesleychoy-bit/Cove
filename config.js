window.SHOP_CONFIG = {
  shopName: "Cove",
  tagline: "",
  unitPerQty: 10,
  // Shown under each product price, e.g. "12g · 10 packs" (weight first)
  packGramLabel: "12g",
  // Free shipping when subtotal reaches this amount (HK$)
  freeShippingAtAmount: 240,
  shippingFee: 30,
  currencyLabel: "HK$",
  // English only; shown in footer + checkout (edit wording here).
  disclaimerNote:
    "Orders will be shipped within 7 days after confirmation.\n\n" +
    "All sales are final once shipped.\n\n" +
    "As drip bags contain fresh roasted coffee, returns and refunds are not accepted except in cases of manufacturing defects or damage during delivery.\n\n" +
    "We appreciate your understanding.",
  payMeUrl: "https://payme.hsbc/996976ef1a4840e397b5d218c81a662a",
  // 可選：K Pay 商戶收款連結（信用卡／錢包等由 K Pay 提供）。留空則結帳不顯示 K Pay 按鈕；PayMe／FPS 仍用上面與 fpsId。
  kpayUrl: "",
  // General enquiries (Contact section only — separate from FPS below).
  contactPhone: "90137619",
  contactEmail: "covecoffeeinfo@gmail.com",
  fpsId: "128799590",
  fpsNote: "Please put the Order ID in the transfer remark.",
  // Optional: Google Apps Script Web App URL. POST JSON includes paymentProofBase64 / Mime / FileName
  // (入數截圖). See order-email-handler.example.gs to attach the image in Gmail.
  orderEndpoint:
    "https://script.google.com/macros/s/AKfycbxF6Q7Glv1jU4kGPdNyuA--hfzKtkOeV50dTa341AswGQgwr6ZxjN3OZ_wmSD8mlCLQqA/exec",
};