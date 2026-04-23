const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const key = (event.queryStringParameters || {}).key;
  if (!key) return { statusCode: 400, body: 'Missing key parameter' };

  try {
    const store = getStore('travel-images');
    const entry = await store.getWithMetadata(key, { type: 'arrayBuffer' });

    if (!entry) return { statusCode: 404, body: 'Image not found' };

    const contentType = entry.metadata?.contentType || 'image/jpeg';
    const base64 = Buffer.from(entry.data).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
