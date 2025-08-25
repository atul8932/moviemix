export default async function handler(req, res) {
  try {
    console.log('=== CREATE-PAYMENT FUNCTION CALLED ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('URL:', req.url);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get Cashfree credentials from environment variables
    const CF_CLIENT_ID = process.env.CF_CLIENT_ID;
    const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
    
    console.log('Environment Variables:');
    console.log('- CF_CLIENT_ID:', CF_CLIENT_ID ? CF_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET');
    console.log('- CF_CLIENT_SECRET:', CF_CLIENT_SECRET ? CF_CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');
    console.log('- CF_API_URL:', process.env.CF_API_URL || 'NOT SET (using default)');

    if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
      console.error('Missing Cashfree credentials');
      return res.status(500).json({ 
        error: 'Cashfree credentials not configured' 
      });
    }

    const { orderAmount, customerPhone, customerEmail, returnUrl } = req.body;
    
    console.log('Request Body Parsed:');
    console.log('- orderAmount:', orderAmount);
    console.log('- customerPhone:', customerPhone);
    console.log('- customerEmail:', customerEmail);
    console.log('- returnUrl:', returnUrl);

    if (!orderAmount || !customerPhone) {
      console.error('Missing required fields:', { orderAmount, customerPhone });
      return res.status(400).json({ 
        error: 'Missing required fields: orderAmount, customerPhone' 
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create order payload for Cashfree (matching working curl exactly)
    const orderPayload = {
      order_amount: parseFloat(orderAmount),
      order_currency: "INR",
      customer_details: {
        customer_id: `bpaagIWG4lMSrIpO92vtIc5A3w23`, // Use exact customer_id from curl
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: returnUrl || (req.headers.origin || "http://localhost:5173") + "#/dashboard"
      },
    };

    // Log the URL and payload being sent
    const cashfreeUrl = (process.env.CF_API_URL || 'https://sandbox.cashfree.com/pg') + '/orders';
    console.log('=== CASHFREE API CALL ===');
    console.log('URL:', cashfreeUrl);
    console.log('Headers:', {
      'Accept': 'application/json',
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
      'x-client-id': CF_CLIENT_ID.substring(0, 10) + '...',
      'x-client-secret': CF_CLIENT_SECRET.substring(0, 10) + '...'
    });
    console.log('Payload:', JSON.stringify(orderPayload, null, 2));

    // Call Cashfree API to create order
    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'x-api-version': '2022-01-01',
        'Content-Type': 'application/json',
        'x-client-id': CF_CLIENT_ID,
        'x-client-secret': CF_CLIENT_SECRET,
      },
      body: JSON.stringify(orderPayload)
    });

    console.log('=== CASHFREE RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Cashfree API Error Response:');
      console.error('Status:', response.status);
      console.error('Error Data:', errorData);
      return res.status(response.status).json({
        error: 'Failed to create payment order',
        details: errorData
      });
    }

    const data = await response.json();
    console.log('=== CASHFREE SUCCESS RESPONSE ===');
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    const responsePayload = {
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id || data.order_token,
      order_amount: data.order_amount,
      cashfree_order_id: data.cf_order_id,
      payment_link: data.payment_link
    };
    
    console.log('=== SENDING RESPONSE TO FRONTEND ===');
    console.log('Response Payload:', JSON.stringify(responsePayload, null, 2));
    
    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error('=== FUNCTION CRASHED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}