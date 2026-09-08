/** DigiTour Bookings API — POST create | GET by email → bookings.json via Blobs */
const { json, corsHeaders, loadCollection, saveCollection } = require('./_data');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }

  try {
    let bookings = await loadCollection('bookings', 'bookings.json', []);
    if (!Array.isArray(bookings)) bookings = [];

    if (event.httpMethod === 'GET') {
      const email = (event.queryStringParameters && event.queryStringParameters.email) || '';
      const list = email
        ? bookings.filter((b) => String(b.guest_email).toLowerCase() === email.toLowerCase())
        : bookings.slice(0, 50);
      return json(200, { bookings: list });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const code = 'DT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const booking = {
        id: 'bk_' + Date.now(),
        confirmation_code: body.confirmation_code || code,
        hotel_id: body.hotel_id,
        hotel_name: body.hotel || body.hotel_name || '',
        destination: body.destination || '',
        check_in: body.check_in,
        check_out: body.check_out,
        guests: parseInt(body.guests, 10) || 1,
        total_usd: parseFloat(body.total_usd) || 0,
        guest_name: body.guest_name || '',
        guest_email: String(body.guest_email || '').trim().toLowerCase(),
        status: 'pending',
        points_awarded: 50,
        created_at: new Date().toISOString(),
      };
      if (!booking.hotel_id || !booking.check_in || !booking.check_out || !booking.guest_email) {
        return json(400, { error: 'hotel_id, dates and guest_email are required.' });
      }
      bookings.unshift(booking);
      await saveCollection('bookings', 'bookings.json', bookings);
      return json(200, {
        ok: true,
        booking,
        message: 'Booking saved. +50 loyalty points awarded.',
      });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (err) {
    return json(500, { error: err.message || 'Booking failed' });
  }
};
