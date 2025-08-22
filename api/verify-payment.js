export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Replace these with your actual Cashfree credentials
  const CF_CLIENT_ID = "TEST10765407bb6b69b6cd8c47dbff1b4197";  // Replace with your App ID
  const CF_CLIENT_SECRET = "cfsk_ma_test_your_secret_key_here";   // Replace with your Secret Key

  if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Cashfree credentials not configured' 
    });
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Check order status from Cashfree
    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        'Accept': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CF_CLIENT_ID,
        'x-client-secret': CF_CLIENT_SECRET,
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cashfree verification error:', errorData);
      return res.status(response.status).json({
        error: 'Failed to verify payment',
        details: errorData
      });
    }

    const orderData = await response.json();
    
    return res.status(200).json({
      success: true,
      order_id: orderData.order_id,
      order_status: orderData.order_status,
      order_amount: orderData.order_amount,
      payment_method: orderData.payments?.[0]?.payment_method || null,
      cf_order_id: orderData.cf_order_id
    });

  } catch (error) {
    console.error('Payment verification error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}