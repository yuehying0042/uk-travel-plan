/**
 * ── 設定檔 ──────────────────────────────────────
 * 請將 Notion 各資料庫 ID 填入下方。
 * 取得方式：在 Notion 開啟資料庫頁面 → 複製 URL
 * URL 格式: https://notion.so/<workspace>/<DATABASE_ID>?v=...
 * DATABASE_ID 為 32 位英數字串
 */

const CONFIG = {
  DB: {
    ITINERARY:   'YOUR_ITINERARY_DATABASE_ID',
    EXPENSES:    'YOUR_EXPENSES_DATABASE_ID',
    TICKETS:     'YOUR_TICKETS_DATABASE_ID',
    ATTRACTIONS: 'YOUR_ATTRACTIONS_DATABASE_ID',
    TIPS:        'YOUR_TIPS_DATABASE_ID',
  },

  TRIP: {
    TITLE:    '英國旅遊計畫',
    DURATION: 14,
  }
};
