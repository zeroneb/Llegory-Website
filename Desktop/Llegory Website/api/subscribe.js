export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  const serverPrefix = apiKey.split('-')[1];

  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`anystring:${apiKey}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status: 'pending',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Subscription failed' });
    }

    return res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}