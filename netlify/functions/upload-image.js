const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { imageData, key } = body;
  if (!imageData || !key) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing imageData or key' }) };
  }

  const match = imageData.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid image format' }) };
  }

  const [, contentType, base64Data] = match;
  const buffer = Buffer.from(base64Data, 'base64');

  try {
    const store = getStore('travel-images');
    await store.set(key, buffer, { metadata: { contentType } });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        url: `/.netlify/functions/get-image?key=${encodeURIComponent(key)}`,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
