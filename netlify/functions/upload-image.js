const { getStore } = require('@netlify/blobs');

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (e) { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON: ' + e.message }) }; }

  const { imageData, key } = body || {};
  if (!imageData || !key) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing imageData or key' }) };
  }

  // Parse data URI: data:<mime>;base64,<data>
  const semi  = imageData.indexOf(';base64,');
  if (semi === -1) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid data URI format' }) };
  }
  const contentType = imageData.slice(5, semi);            // 'image/jpeg' etc.
  const base64Data  = imageData.slice(semi + 8);           // strip ';base64,'
  const buffer      = Buffer.from(base64Data, 'base64');

  try {
    const store = getStore({ name: 'travel-images', consistency: 'strong' });
    await store.set(key, buffer, { metadata: { contentType } });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({
        url: `/.netlify/functions/get-image?key=${encodeURIComponent(key)}`,
      }),
    };
  } catch (err) {
    console.error('[upload-image] Blob store error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
