export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.mailchimp_api_key;
  const listId = process.env.mailchimp_list_id;

  if (!apiKey || !listId) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

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
        status: 'subscribed',
      }),
    });

    const text = await response.text();
    console.log('Mailchimp Response Status:', response.status);
    console.log('Mailchimp Response Text:', text);

    if (!response.ok) {
      try {
        const data = JSON.parse(text);
        return res.status(response.status).json({ error: data.detail || data.title || JSON.stringify(data) });
      } catch (e) {
        return res.status(response.status).json({ error: text.substring(0, 100) });
      }
    }

    return res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.log('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
