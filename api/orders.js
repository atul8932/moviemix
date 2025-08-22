const axios = require('axios');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CF_CLIENT_ID = process.env.VITE_CASHFREE_CLIENT_ID;
  const CF_CLIENT_SECRET = process.env.VITE_CASHFREE_CLIENT_SECRET;

  if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Cashfree credentials not configured' });
  }

  try {
    if (req.method === 'POST') {
      // Create order
      const response = await axios.post(
        'https://sandbox.cashfree.com/pg/orders',
        req.body,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
          },
        }
      );
      res.status(200).json(response.data);
    } else if (req.method === 'GET') {
      // Get order status
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
      }

      const response = await axios.get(
        `https://sandbox.cashfree.com/pg/orders/${orderId}`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
          },
        }
      );
      res.status(200).json(response.data);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Cashfree API error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || error.message || 'Internal server error'
    });
  }
}