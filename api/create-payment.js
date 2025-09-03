import { logger } from '../src/utils/logger.js';

export default async function handler(req, res) {
  try {
    logger.safeLog('=== CREATE-PAYMENT FUNCTION CALLED ===');
    logger.log('Method:', req.method);
    logger.log('Headers:', req.headers);
    logger.log('Body:', logger.sanitizeData(req.body));
    logger.log('URL:', req.url);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      logger.log('Handling OPTIONS preflight request');
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      logger.log('Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get Cashfree credentials from environment variables
    const CF_CLIENT_ID = process.env.CF_CLIENT_ID;
    const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
    
    logger.log('Environment Variables:');
    logger.log('- CF_CLIENT_ID:', CF_CLIENT_ID ? CF_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET');
    logger.log('- CF_CLIENT_SECRET:', CF_CLIENT_SECRET ? CF_CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');
    logger.log('- CF_API_URL:', process.env.CF_API_URL || 'NOT SET (using default)');

    if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
      logger.error('Missing Cashfree credentials');
      return res.status(500).json({ 
        error: 'Cashfree credentials not configured' 
      });
    }

    const { orderAmount, customerPhone, customerEmail, returnUrl } = req.body;
    
    logger.log('Request Body Parsed:');
    logger.log('- orderAmount:', orderAmount);
    logger.log('- customerPhone:', logger.sanitizeData({ customerPhone }));
    logger.log('- customerEmail:', logger.sanitizeData({ customerEmail }));
    logger.log('- returnUrl:', returnUrl);

    if (!orderAmount || !customerPhone) {
      logger.error('Missing required fields:', logger.sanitizeData({ orderAmount, customerPhone }));
      return res.status(400).json({ 
        error: 'Missing required fields: orderAmount and customerPhone are required' 
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
    logger.safeLog('=== CASHFREE API CALL ===');
    logger.log('URL:', cashfreeUrl);
    logger.log('Headers:', {
      'Accept': 'application/json',
      'x-api-version': '2022-01-01',
      'Content-Type': 'application/json',
      'x-client-id': CF_CLIENT_ID.substring(0, 10) + '...',
      'x-client-secret': CF_CLIENT_SECRET.substring(0, 10) + '...'
    });
    logger.log('Payload:', JSON.stringify(orderPayload, null, 2));

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

    logger.safeLog('=== CASHFREE RESPONSE ===');
    logger.log('Status:', response.status);
    logger.log('Status Text:', response.statusText);
    logger.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.text();
      logger.error('Cashfree API Error Response:');
      logger.error('Status:', response.status);
      logger.error('Error Data:', errorData);
      return res.status(response.status).json({
        error: 'Failed to create payment order',
        details: errorData
      });
    }

    const data = await response.json();
    logger.safeLog('=== CASHFREE SUCCESS RESPONSE ===');
    logger.log('Response Data:', JSON.stringify(data, null, 2));
    
    const responsePayload = {
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id || data.order_token,
      order_amount: data.order_amount,
      cashfree_order_id: data.cf_order_id,
      payment_link: data.payment_link
    };
    
    logger.safeLog('=== SENDING RESPONSE TO FRONTEND ===');
    logger.log('Response Payload:', JSON.stringify(responsePayload, null, 2));
    
    return res.status(200).json(responsePayload);

  } catch (error) {
    logger.error('=== FUNCTION CRASHED ===');
    logger.error('Error:', error.message);
    logger.error('Stack:', error.stack);
    
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}