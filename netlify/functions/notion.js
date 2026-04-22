const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return corsResponse(200, '');
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return corsResponse(500, JSON.stringify({ error: 'NOTION_TOKEN 環境變數未設定' }));
  }

  const notionPath = (event.queryStringParameters || {}).path;
  if (!notionPath) {
    return corsResponse(400, JSON.stringify({ error: 'Missing path parameter' }));
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.notion.com',
      path:     `/v1/${notionPath}`,
      method:   event.httpMethod,
      headers: {
        'Authorization':  `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type':   'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(corsResponse(res.statusCode, body)));
    });

    req.on('error', (err) => resolve(corsResponse(500, JSON.stringify({ error: err.message }))));

    if (event.body) req.write(event.body);
    req.end();
  });
};

function corsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type':                 'application/json',
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body,
  };
}
