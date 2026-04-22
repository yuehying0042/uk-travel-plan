/* ── Travel App ─────────────────────────────────────────────────────── */

const App = (() => {

  // ── State ───────────────────────────────────────────────────────────
  let currentModal = null;
  let editingId    = null;
  let allAttractions = [];
  let allTickets     = [];
  let ticketFilter   = 'all';
  const itemStore    = {};   // id → raw item data for pre-populating edit forms

  // ── Notion API ──────────────────────────────────────────────────────

  async function notionRequest(path, method = 'GET', body = null) {
    const url  = `/.netlify/functions/notion?path=${encodeURIComponent(path)}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || `Notion error ${res.status}`);
    return json;
  }

  async function queryDB(dbId, sorts = []) {
    if (!dbId || dbId.startsWith('YOUR_')) return { results: [] };
    return notionRequest(`databases/${dbId}/query`, 'POST', { sorts, page_size: 100 });
  }

  async function createPage(dbId, properties) {
    return notionRequest('pages', 'POST', { parent: { database_id: dbId }, properties });
  }

  async function updatePage(pageId, properties) {
    return notionRequest(`pages/${pageId}`, 'PATCH', { properties });
  }

  async function archivePage(pageId) {
    return notionRequest(`pages/${pageId}`, 'PATCH', { archived: true });
  }

  // ── Notion Property Helpers ─────────────────────────────────────────

  const prop = {
    title:  (v) => ({ title:     [{ text: { content: String(v || '') } }] }),
    text:   (v) => ({ rich_text: [{ text: { content: String(v || '') } }] }),
    date:   (v) => v ? { date: { start: v } } : { date: null },
    number: (v) => ({ number: v !== '' && v != null ? parseFloat(v) : null }),
    select: (v) => v ? { select: { name: String(v) } } : { select: null },
    url:    (v) => ({ url: v || null }),
  };

  const get = {
    title:  (p, k) => p[k]?.title?.[0]?.plain_text     || '',
    text:   (p, k) => p[k]?.rich_text?.[0]?.plain_text || '',
    date:   (p, k) => p[k]?.date?.start                || '',
    number: (p, k) => p[k]?.number  ?? null,
    select: (p, k) => p[k]?.select?.name               || '',
    url:    (p, k) => p[k]?.url                        || '',
  };

  // ── Navigation ──────────────────────────────────────────────────────

  function initNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        item.classList.add('active');
        document.getElementById(`section-${section}`).classList.add('active');
        loadSection(section);
      });
    });
  }

  function loadSection(section) {
    const map = {
      itinerary:   loadItinerary,
      expenses:    loadExpenses,
      tickets:     loadTickets,
      attractions: loadAttractions,
      tips:        loadTips,
    };
    if (map[section]) map[section]();
  }

  // ── Itinerary ───────────────────────────────────────────────────────

  async function loadItinerary() {
    const el = document.getElementById('itinerary-content');
    el.innerHTML = '<div class="loading-state">讀取中...</div>';

    try {
      const data = await queryDB(CONFIG.DB.ITINERARY, [
        { property: 'Date', direction: 'ascending' },
        { property: 'Time', direction: 'ascending' },
      ]);

      if (!data.results.length) {
        el.innerHTML = '<div class="empty-state">尚無行程，點擊右上角「＋ 新增行程」開始規劃</div>';
        return;
      }

      const days = {};
      data.results.forEach(page => {
        const p    = page.properties;
        const date = get.date(p, 'Date');
        const day  = get.number(p, 'Day');
        const key  = date || page.id;

        if (!days[key]) days[key] = { date, day, activities: [] };

        const item = {
          id:           page.id,
          time:         get.text(p, 'Time'),
          name:         get.title(p, 'Name'),
          attractionCN: get.text(p, 'AttractionCN'),
          attractionEN: get.text(p, 'AttractionEN'),
          mapUrl:       get.url(p, 'GoogleMaps'),
          notes:        get.text(p, 'Notes'),
          _date:        date,
          _day:         day,
        };
        itemStore[page.id] = item;
        days[key].activities.push(item);
      });

      el.innerHTML = Object.values(days).map(({ date, day, activities }) => `
        <div class="day-group">
          <div class="day-header">
            ${day ? `<span class="day-num">DAY ${day}</span>` : ''}
            <span class="day-date">${formatDate(date)}</span>
          </div>
          <ul class="activity-list">
            ${activities.map(renderActivity).join('')}
          </ul>
        </div>
      `).join('');

    } catch (e) {
      el.innerHTML = '<div class="empty-state">載入失敗，請確認 Notion 設定是否正確</div>';
      showSetupBanner();
    }
  }

  function renderActivity(a) {
    return `
      <li class="activity-item" id="act-${a.id}">
        <div class="activity-time">${a.time || '—'}</div>
        <div class="activity-body">
          <div class="activity-name">${escHtml(a.name)}</div>
          ${a.attractionCN || a.attractionEN ? `
            <div class="activity-sub">
              ${escHtml(a.attractionCN)}${a.attractionEN ? ` · <em>${escHtml(a.attractionEN)}</em>` : ''}
            </div>
          ` : ''}
          ${a.notes ? `<div class="activity-sub" style="margin-top:3px">${escHtml(a.notes)}</div>` : ''}
        </div>
        <div class="activity-actions">
          ${a.mapUrl ? `<a class="map-link" href="${a.mapUrl}" target="_blank" rel="noopener">地圖</a>` : ''}
          <button class="btn-ghost" onclick="App.openModal('itinerary','${a.id}')">編輯</button>
          <button class="btn-danger" onclick="App.deleteItem('${a.id}','itinerary')">刪除</button>
        </div>
      </li>
    `;
  }

  // ── Expenses ────────────────────────────────────────────────────────

  async function loadExpenses() {
    const sumEl = document.getElementById('expense-summary');
    const el    = document.getElementById('expense-content');
    el.innerHTML = '<div class="loading-state">讀取中...</div>';
    sumEl.innerHTML = '';

    try {
      const data = await queryDB(CONFIG.DB.EXPENSES, [
        { property: 'Date', direction: 'ascending' },
      ]);

      const expenses = data.results.map(page => {
        const p = page.properties;
        const item = {
          id:       page.id,
          name:     get.title(p, 'Name'),
          date:     get.date(p, 'Date'),
          amount:   get.number(p, 'Amount') ?? 0,
          category: get.select(p, 'Category'),
          notes:    get.text(p, 'Notes'),
        };
        itemStore[page.id] = item;
        return item;
      });

      renderExpenseSummary(sumEl, expenses);

      if (!expenses.length) {
        el.innerHTML = '<div class="empty-state">尚無支出記錄，點擊右上角「＋ 新增支出」</div>';
        return;
      }

      el.innerHTML = `
        <table class="expense-table">
          <thead>
            <tr>
              <th>日期</th><th>項目</th><th>類別</th><th>金額（£）</th><th>備注</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr id="exp-${e.id}">
                <td>${formatDate(e.date)}</td>
                <td>${escHtml(e.name)}</td>
                <td><span class="category-badge">${escHtml(e.category)}</span></td>
                <td>£${e.amount.toFixed(2)}</td>
                <td style="color:var(--muted);font-size:12px">${escHtml(e.notes)}</td>
                <td>
                  <div class="expense-actions">
                    <button class="btn-ghost" onclick="App.openModal('expense','${e.id}')">編輯</button>
                    <button class="btn-danger" onclick="App.deleteItem('${e.id}','expenses')">刪除</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    } catch (e) {
      el.innerHTML = '<div class="empty-state">載入失敗，請確認 Notion 設定是否正確</div>';
      showSetupBanner();
    }
  }

  function renderExpenseSummary(el, expenses) {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const cats  = {};
    expenses.forEach(e => { if (e.category) cats[e.category] = (cats[e.category] || 0) + e.amount; });
    const top3  = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3);

    el.innerHTML = `
      <div class="summary-card">
        <div class="summary-label">總支出</div>
        <div class="summary-value accent">£${total.toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">筆數</div>
        <div class="summary-value">${expenses.length}</div>
      </div>
      ${top3.map(([cat, amt]) => `
        <div class="summary-card">
          <div class="summary-label">${escHtml(cat)}</div>
          <div class="summary-value">£${amt.toFixed(2)}</div>
        </div>
      `).join('')}
    `;
  }

  // ── Tickets ─────────────────────────────────────────────────────────

  async function loadTickets() {
    const el = document.getElementById('ticket-content');
    el.innerHTML = '<div class="loading-state">讀取中...</div>';

    try {
      const data = await queryDB(CONFIG.DB.TICKETS, [
        { property: 'Date', direction: 'ascending' },
      ]);

      allTickets = data.results.map(page => {
        const p = page.properties;
        const item = {
          id:     page.id,
          name:   get.title(p, 'Name'),
          type:   get.select(p, 'Type'),
          date:   get.date(p, 'Date'),
          amount: get.number(p, 'Amount') ?? 0,
          link:   get.url(p, 'Link'),
          notes:  get.text(p, 'Notes'),
        };
        itemStore[page.id] = item;
        return item;
      });

      initTicketTabs();
      renderTickets();

    } catch (e) {
      el.innerHTML = '<div class="empty-state">載入失敗，請確認 Notion 設定是否正確</div>';
      showSetupBanner();
    }
  }

  function initTicketTabs() {
    document.querySelectorAll('#ticket-tabs .filter-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('#ticket-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        ticketFilter = tab.dataset.filter;
        renderTickets();
      };
    });
  }

  function renderTickets() {
    const el       = document.getElementById('ticket-content');
    const filtered = ticketFilter === 'all' ? allTickets : allTickets.filter(t => t.type === ticketFilter);

    if (!filtered.length) {
      el.innerHTML = '<div class="empty-state">尚無票券，點擊右上角「＋ 新增票券」</div>';
      return;
    }

    el.innerHTML = `<div class="ticket-grid">${filtered.map(t => `
      <div class="ticket-card" id="tkt-${t.id}">
        <div class="ticket-actions">
          <button class="btn-ghost" onclick="App.openModal('ticket','${t.id}')">編輯</button>
          <button class="btn-danger" onclick="App.deleteItem('${t.id}','tickets')">刪除</button>
        </div>
        ${t.type ? `<div class="ticket-type-badge">${escHtml(t.type)}</div>` : ''}
        <div class="ticket-name">${escHtml(t.name)}</div>
        <div class="ticket-meta">${formatDate(t.date)}</div>
        <div class="ticket-amount-wrap">
          <div class="ticket-amount-label">金額</div>
          <div class="ticket-amount">£${t.amount.toFixed(2)}</div>
        </div>
        ${t.notes ? `<div class="ticket-notes">${escHtml(t.notes)}</div>` : ''}
        ${t.link ? `<a class="map-link" href="${t.link}" target="_blank" rel="noopener" style="margin-top:12px;display:inline-flex">查看票券</a>` : ''}
      </div>
    `).join('')}</div>`;
  }

  // ── Attractions ─────────────────────────────────────────────────────

  async function loadAttractions() {
    const el = document.getElementById('attraction-content');
    el.innerHTML = '<div class="loading-state">讀取中...</div>';

    try {
      const data = await queryDB(CONFIG.DB.ATTRACTIONS, [
        { property: 'City', direction: 'ascending' },
      ]);

      allAttractions = data.results.map(page => {
        const p = page.properties;
        const item = {
          id:     page.id,
          nameCN: get.title(p, 'NameCN'),
          nameEN: get.text(p, 'NameEN'),
          city:   get.select(p, 'City'),
          desc:   get.text(p, 'Description'),
          mapUrl: get.url(p, 'GoogleMaps'),
          image:  get.url(p, 'Image'),
        };
        itemStore[page.id] = item;
        return item;
      });

      renderAttractions(allAttractions);

    } catch (e) {
      el.innerHTML = '<div class="empty-state">載入失敗，請確認 Notion 設定是否正確</div>';
      showSetupBanner();
    }
  }

  function renderAttractions(list) {
    const el = document.getElementById('attraction-content');

    if (!list.length) {
      el.innerHTML = '<div class="empty-state">尚無景點，點擊右上角「＋ 新增景點」</div>';
      return;
    }

    el.innerHTML = `<div class="attraction-grid">${list.map(a => `
      <div class="attraction-card" id="att-${a.id}">
        <div class="attraction-actions">
          <button class="btn-ghost" onclick="App.openModal('attraction','${a.id}')">編輯</button>
          <button class="btn-danger" onclick="App.deleteItem('${a.id}','attractions')">刪除</button>
        </div>
        ${a.image
          ? `<img class="attraction-img" src="${a.image}" alt="${escHtml(a.nameCN)}" loading="lazy" onerror="this.style.display='none'">`
          : `<div class="attraction-img-placeholder">PHOTO</div>`
        }
        <div class="attraction-body">
          ${a.city ? `<div class="attraction-city">${escHtml(a.city).toUpperCase()}</div>` : ''}
          <div class="attraction-name-cn">${escHtml(a.nameCN)}</div>
          ${a.nameEN ? `<div class="attraction-name-en">${escHtml(a.nameEN)}</div>` : ''}
          ${a.desc ? `<div class="attraction-desc">${escHtml(a.desc)}</div>` : ''}
          <div class="attraction-footer">
            ${a.mapUrl ? `<a class="map-link" href="${a.mapUrl}" target="_blank" rel="noopener">查看地圖</a>` : '<span></span>'}
          </div>
        </div>
      </div>
    `).join('')}</div>`;
  }

  function filterAttractions(q) {
    const lower    = q.toLowerCase();
    const filtered = allAttractions.filter(a =>
      a.nameCN.includes(q) ||
      a.nameEN.toLowerCase().includes(lower) ||
      a.city.toLowerCase().includes(lower)
    );
    renderAttractions(filtered);
  }

  // ── Tips ────────────────────────────────────────────────────────────

  async function loadTips() {
    const el = document.getElementById('tips-content');
    el.innerHTML = '<div class="loading-state">讀取中...</div>';

    try {
      const data = await queryDB(CONFIG.DB.TIPS, [
        { property: 'Category', direction: 'ascending' },
        { property: 'Priority',  direction: 'ascending' },
      ]);

      const tips = data.results.map(page => {
        const p = page.properties;
        const item = {
          id:       page.id,
          title:    get.title(p, 'Name'),
          category: get.select(p, 'Category'),
          priority: get.select(p, 'Priority'),
          content:  get.text(p, 'Content'),
        };
        itemStore[page.id] = item;
        return item;
      });

      if (!tips.length) {
        el.innerHTML = '<div class="empty-state">尚無注意事項，點擊右上角「＋ 新增事項」</div>';
        return;
      }

      const categories = {};
      tips.forEach(t => {
        const cat = t.category || '其他';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(t);
      });

      el.innerHTML = Object.entries(categories).map(([cat, items]) => `
        <div class="tips-category">
          <div class="tips-category-header">${escHtml(cat)}</div>
          ${items.map(t => `
            <div class="tip-item" id="tip-${t.id}">
              <div class="priority-dot priority-${priorityClass(t.priority)}"></div>
              <div class="tip-body">
                <div class="tip-title">${escHtml(t.title)}</div>
                ${t.content ? `<div class="tip-content">${escHtml(t.content)}</div>` : ''}
              </div>
              <div class="tip-actions">
                <button class="btn-ghost" onclick="App.openModal('tip','${t.id}')">編輯</button>
                <button class="btn-danger" onclick="App.deleteItem('${t.id}','tips')">刪除</button>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('');

    } catch (e) {
      el.innerHTML = '<div class="empty-state">載入失敗，請確認 Notion 設定是否正確</div>';
      showSetupBanner();
    }
  }

  function priorityClass(p) {
    if (p === '高') return 'high';
    if (p === '中') return 'mid';
    return 'low';
  }

  // ── Modal & Forms ────────────────────────────────────────────────────

  const FORMS = {

    itinerary: {
      title:  (id) => id ? '編輯行程' : '新增行程',
      fields: [
        { row: [
          { key: 'Date', label: '日期',   type: 'date'   },
          { key: 'Day',  label: '第幾天', type: 'number', placeholder: '例: 1' },
        ]},
        { row: [
          { key: 'Time', label: '時間',     type: 'text', placeholder: '09:00 - 11:00' },
          { key: 'Name', label: '活動名稱', type: 'text', placeholder: '參觀大英博物館', required: true },
        ]},
        { row: [
          { key: 'AttractionCN', label: '景點名稱（中文）', type: 'text', placeholder: '大英博物館' },
          { key: 'AttractionEN', label: '景點名稱（英文）', type: 'text', placeholder: 'British Museum' },
        ]},
        { key: 'GoogleMaps', label: 'Google Maps 連結', type: 'url', placeholder: 'https://maps.app.goo.gl/...' },
        { key: 'Notes',      label: '備注',            type: 'textarea', placeholder: '需提前預約...' },
      ],
      toProps: (d) => ({
        Name:         prop.title(d.Name),
        Date:         prop.date(d.Date),
        Day:          prop.number(d.Day),
        Time:         prop.text(d.Time),
        AttractionCN: prop.text(d.AttractionCN),
        AttractionEN: prop.text(d.AttractionEN),
        GoogleMaps:   prop.url(d.GoogleMaps),
        Notes:        prop.text(d.Notes),
      }),
      dbKey: 'ITINERARY',
      reload: loadItinerary,
      fillItem: (item) => ({
        Name: item.name, Date: item._date, Day: item._day,
        Time: item.time, AttractionCN: item.attractionCN,
        AttractionEN: item.attractionEN, GoogleMaps: item.mapUrl,
        Notes: item.notes,
      }),
    },

    expense: {
      title:  (id) => id ? '編輯支出' : '新增支出',
      fields: [
        { row: [
          { key: 'Date',   label: '日期',     type: 'date' },
          { key: 'Amount', label: '金額（£）', type: 'number', placeholder: '0.00' },
        ]},
        { row: [
          { key: 'Name',     label: '項目名稱', type: 'text',   placeholder: '午餐', required: true },
          { key: 'Category', label: '類別',     type: 'select', options: ['餐飲','交通','門票','購物','住宿','其他'] },
        ]},
        { key: 'Notes', label: '備注', type: 'textarea', placeholder: '...' },
      ],
      toProps: (d) => ({
        Name:     prop.title(d.Name),
        Date:     prop.date(d.Date),
        Amount:   prop.number(d.Amount),
        Category: prop.select(d.Category),
        Notes:    prop.text(d.Notes),
      }),
      dbKey: 'EXPENSES',
      reload: loadExpenses,
      fillItem: (item) => ({
        Name: item.name, Date: item.date, Amount: item.amount,
        Category: item.category, Notes: item.notes,
      }),
    },

    ticket: {
      title:  (id) => id ? '編輯票券' : '新增票券',
      fields: [
        { row: [
          { key: 'Name', label: '票券名稱', type: 'text',   placeholder: '大英博物館門票', required: true },
          { key: 'Type', label: '類型',     type: 'select', options: ['門票','車票','其他'] },
        ]},
        { row: [
          { key: 'Date',   label: '日期',     type: 'date' },
          { key: 'Amount', label: '金額（£）', type: 'number', placeholder: '0.00' },
        ]},
        { key: 'Link',  label: '票券連結', type: 'url',      placeholder: 'https://...' },
        { key: 'Notes', label: '備注',     type: 'textarea', placeholder: '...' },
      ],
      toProps: (d) => ({
        Name:   prop.title(d.Name),
        Type:   prop.select(d.Type),
        Date:   prop.date(d.Date),
        Amount: prop.number(d.Amount),
        Link:   prop.url(d.Link),
        Notes:  prop.text(d.Notes),
      }),
      dbKey: 'TICKETS',
      reload: loadTickets,
      fillItem: (item) => ({
        Name: item.name, Type: item.type, Date: item.date,
        Amount: item.amount, Link: item.link, Notes: item.notes,
      }),
    },

    attraction: {
      title:  (id) => id ? '編輯景點' : '新增景點',
      fields: [
        { row: [
          { key: 'NameCN', label: '景點名稱（中文）', type: 'text', placeholder: '大英博物館', required: true },
          { key: 'NameEN', label: '景點名稱（英文）', type: 'text', placeholder: 'British Museum' },
        ]},
        { key: 'City', label: '城市', type: 'select', options: [
            '倫敦 London','愛丁堡 Edinburgh','牛津 Oxford','劍橋 Cambridge',
            '巴斯 Bath','約克 York','利物浦 Liverpool','曼徹斯特 Manchester',
            '溫莎 Windsor','科茨沃爾德 Cotswolds','其他',
          ],
        },
        { key: 'Description', label: '景點介紹', type: 'textarea', placeholder: '...' },
        { key: 'GoogleMaps',  label: 'Google Maps 連結', type: 'url', placeholder: 'https://maps.app.goo.gl/...' },
        { key: 'Image',       label: '封面圖片連結（選填）', type: 'url', placeholder: 'https://...' },
      ],
      toProps: (d) => ({
        NameCN:      prop.title(d.NameCN),
        NameEN:      prop.text(d.NameEN),
        City:        prop.select(d.City),
        Description: prop.text(d.Description),
        GoogleMaps:  prop.url(d.GoogleMaps),
        Image:       prop.url(d.Image),
      }),
      dbKey: 'ATTRACTIONS',
      reload: loadAttractions,
      fillItem: (item) => ({
        NameCN: item.nameCN, NameEN: item.nameEN, City: item.city,
        Description: item.desc, GoogleMaps: item.mapUrl, Image: item.image,
      }),
    },

    tip: {
      title:  (id) => id ? '編輯注意事項' : '新增注意事項',
      fields: [
        { row: [
          { key: 'Name',     label: '標題', type: 'text',   placeholder: '地鐵禮儀', required: true },
          { key: 'Category', label: '類別', type: 'select', options: ['安全','交通','飲食','禮儀','天氣','緊急聯絡','其他'] },
        ]},
        { row: [
          { key: 'Priority', label: '重要性', type: 'select', options: ['高','中','低'] },
        ]},
        { key: 'Content', label: '內容', type: 'textarea', placeholder: '...' },
      ],
      toProps: (d) => ({
        Name:     prop.title(d.Name),
        Category: prop.select(d.Category),
        Priority: prop.select(d.Priority),
        Content:  prop.text(d.Content),
      }),
      dbKey: 'TIPS',
      reload: loadTips,
      fillItem: (item) => ({
        Name: item.title, Category: item.category,
        Priority: item.priority, Content: item.content,
      }),
    },
  };

  function openModal(type, id = null) {
    const schema = FORMS[type];
    if (!schema) return;
    currentModal = type;
    editingId    = id;

    document.getElementById('modal-title').textContent = schema.title(id);
    document.getElementById('modal-body').innerHTML    = buildForm(schema.fields, id);
    document.getElementById('modal-overlay').classList.add('open');

    if (id && itemStore[id] && schema.fillItem) {
      const values = schema.fillItem(itemStore[id]);
      Object.entries(values).forEach(([key, val]) => {
        const el = document.getElementById(`field-${key}`);
        if (el && val != null) el.value = val;
      });
    }
  }

  function buildForm(fields, id) {
    const rows = fields.map(f =>
      f.row
        ? `<div class="form-row">${f.row.map(buildField).join('')}</div>`
        : buildField(f)
    );

    return `
      <form id="modal-form" onsubmit="App.saveModal(event)">
        ${rows.join('')}
        <div class="form-actions">
          <button type="button" class="btn-ghost" onclick="App.closeModal()">取消</button>
          <button type="submit" class="btn-primary" id="modal-submit">${id ? '儲存變更' : '新增'}</button>
        </div>
      </form>
    `;
  }

  function buildField(f) {
    const fid = `field-${f.key}`;
    let input;

    if (f.type === 'select') {
      input = `
        <select class="form-select" id="${fid}" name="${f.key}">
          <option value="">— 選擇 —</option>
          ${(f.options || []).map(o => `<option value="${o}">${o}</option>`).join('')}
        </select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea class="form-textarea" id="${fid}" name="${f.key}" placeholder="${f.placeholder || ''}"></textarea>`;
    } else {
      input = `<input class="form-input" id="${fid}" name="${f.key}" type="${f.type}" placeholder="${f.placeholder || ''}"${f.required ? ' required' : ''}>`;
    }

    return `
      <div class="form-group">
        <label class="form-label" for="${fid}">${f.label}</label>
        ${input}
      </div>
    `;
  }

  async function saveModal(e) {
    e.preventDefault();
    const schema    = FORMS[currentModal];
    const submitBtn = document.getElementById('modal-submit');
    const formData  = new FormData(e.target);
    const data      = Object.fromEntries(formData.entries());

    submitBtn.disabled    = true;
    submitBtn.textContent = '儲存中...';

    try {
      const properties = schema.toProps(data);
      if (editingId) {
        await updatePage(editingId, properties);
      } else {
        await createPage(CONFIG.DB[schema.dbKey], properties);
      }
      closeModal();
      await schema.reload();
    } catch (err) {
      alert('儲存失敗：' + err.message);
      submitBtn.disabled    = false;
      submitBtn.textContent = editingId ? '儲存變更' : '新增';
    }
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    currentModal = null;
    editingId    = null;
  }

  // ── Delete ──────────────────────────────────────────────────────────

  async function deleteItem(id, section) {
    if (!confirm('確定要刪除嗎？此動作無法復原。')) return;
    try {
      await archivePage(id);
      delete itemStore[id];
      loadSection(section);
    } catch (e) {
      alert('刪除失敗：' + e.message);
    }
  }

  // ── Utilities ───────────────────────────────────────────────────────

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showSetupBanner() {
    const needsSetup = Object.values(CONFIG.DB).some(id => id.startsWith('YOUR_'));
    if (needsSetup) document.getElementById('setup-banner').style.display = 'block';
  }

  // ── Init ────────────────────────────────────────────────────────────

  function init() {
    initNav();
    loadSection('itinerary');
    showSetupBanner();
  }

  return { openModal, closeModal, saveModal, deleteItem, filterAttractions, init };
})();

document.addEventListener('DOMContentLoaded', App.init);
