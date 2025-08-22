export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID || process.env.VITE_CASHFREE_CLIENT_ID;
  const CF_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET || process.env.VITE_CASHFREE_CLIENT_SECRET;

  if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
    // Debug: Log available environment variables (remove in production)
    const envVars = Object.keys(process.env).filter(key => key.includes('CASHFREE'));
    console.log('Available Cashfree env vars:', envVars);
    
    return res.status(500).json({ 
      error: 'Cashfree credentials not configured in environment variables',
      debug: {
        hasClientId: !!CF_CLIENT_ID,
        hasClientSecret: !!CF_CLIENT_SECRET,
        availableEnvVars: envVars
      }
    });
  }

  try {
    const { orderAmount, customerPhone, customerEmail, returnUrl } = req.body;

    if (!orderAmount || !customerPhone) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderAmount, customerPhone' 
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create order payload for Cashfree
    const orderPayload = {
      order_id: orderId,
      order_amount: parseFloat(orderAmount),
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${Date.now()}`,
        customer_phone: customerPhone,
        customer_email: customerEmail || `customer_${Date.now()}@example.com`,
      },
      order_meta: {
        return_url: returnUrl || `${req.headers.origin || 'https://moviemix-git-devnew-tests-projects-300930eb.vercel.app'}/dashboard`,
      },
    };

    // Call Cashfree API to create order
    const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        'x-client-id': CF_CLIENT_ID,
        'x-client-secret': CF_CLIENT_SECRET,
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cashfree API error:', errorData);
      return res.status(response.status).json({
        error: 'Failed to create payment order',
        details: errorData
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id,
      order_amount: data.order_amount,
      cashfree_order_id: data.cf_order_id
    });

  } catch (error) {
    console.error('Payment creation error:', error.message);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}