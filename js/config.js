/**
 * ── 設定檔 ──────────────────────────────────────
 * 請將 Notion 各資料庫 ID 填入下方。
 * 取得方式：在 Notion 開啟資料庫頁面 → 複製 URL
 * URL 格式: https://notion.so/<workspace>/<DATABASE_ID>?v=...
 * DATABASE_ID 為 32 位英數字串
 */

const CONFIG = {
  DB: {
    ITINERARY:   '61bd829cc9234362b58e4b5b3607e9d6',
    EXPENSES:    'd725dc5747d148898364e6eddc4ae354',
    TICKETS:     'fdbb8921675c48f0b856a4f54de2d87b',
    ATTRACTIONS: '5e9eb0e006e24667955da483ed1a2a50',
    TIPS:        '39615d4de5314f66b4624275ecd61134',
  },

  TRIP: {
    TITLE:    '英國旅遊計畫',
    DURATION: 14,
  }
};
