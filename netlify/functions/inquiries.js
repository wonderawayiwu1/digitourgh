/** DigiTour Inquiries API — POST → inquiries.json via Blobs */
const { json, corsHeaders, loadCollection, saveCollection } = require('./_data');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Use POST' });
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const inquiry = {
      id: 'inq_' + Date.now(),
      name: String(body.name || '').trim(),
      email: String(body.email || '').trim().toLowerCase(),
      subject: String(body.subject || 'General inquiry').trim(),
      message: String(body.message || '').trim(),
      created_at: new Date().toISOString(),
      status: 'new',
    };
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      return json(400, { error: 'Name, email and message are required.' });
    }

    let list = await loadCollection('inquiries', 'inquiries.json', []);
    if (!Array.isArray(list)) list = [];
    list.unshift(inquiry);
    await saveCollection('inquiries', 'inquiries.json', list);

    return json(200, { ok: true, inquiry, message: 'Inquiry received. Our team will reply soon.' });
  } catch (err) {
    return json(500, { error: err.message || 'Inquiry failed' });
  }
};
