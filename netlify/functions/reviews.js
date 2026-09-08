/** DigiTour Reviews API — GET list | POST create → reviews.json via Blobs */
const { json, corsHeaders, loadCollection, saveCollection } = require('./_data');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  try {
    let reviews = await loadCollection('reviews', 'reviews.json', []);
    if (!Array.isArray(reviews)) reviews = [];

    if (event.httpMethod === 'GET') {
      const destId = event.queryStringParameters && event.queryStringParameters.destination_id;
      const list = destId
        ? reviews.filter((r) => String(r.destination_id) === String(destId))
        : reviews.slice(0, 100);
      return json(200, { reviews: list });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const review = {
        id: 'rv_' + Date.now(),
        destination_id: body.destination_id,
        dest_title: body.dest_title || body.destination || '',
        full_name: String(body.name || body.full_name || 'Guest').trim(),
        email: String(body.email || '').trim().toLowerCase(),
        rating: Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5)),
        comment: String(body.comment || '').trim(),
        status: 'approved',
        created_at: new Date().toISOString(),
        points_awarded: 15,
      };
      if (!review.destination_id || !review.comment) {
        return json(400, { error: 'destination_id and comment are required.' });
      }
      reviews.unshift(review);
      await saveCollection('reviews', 'reviews.json', reviews);
      return json(200, { ok: true, review, message: 'Review saved. +15 loyalty points.' });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message || 'Reviews error' });
  }
};
