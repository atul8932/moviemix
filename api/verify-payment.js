// api/verify-payment.js
export default async function handler(req, res) {
  console.log('=== VERIFY-PAYMENT FUNCTION CALLED ===');
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

  try {
    const { orderId, userEmail, orderDetails } = req.body;
    
    console.log('=== REQUEST BODY PARSED ===');
    console.log('- orderId:', orderId);
    console.log('- userEmail:', userEmail);
    console.log('- orderDetails:', orderDetails);

    if (!orderId || !userEmail || !orderDetails) {
      console.error('Missing required fields:', { orderId, userEmail, orderDetails });
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, userEmail, orderDetails' 
      });
    }

    // Get Cashfree credentials and API URL from environment variables
    const CF_CLIENT_ID = process.env.CF_CLIENT_ID;
    const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
    const CF_API_URL = process.env.CF_API_URL;
    
    console.log('Environment Variables:');
    console.log('- CF_CLIENT_ID:', CF_CLIENT_ID ? CF_CLIENT_ID.substring(0, 10) + '...' : 'NOT SET');
    console.log('- CF_CLIENT_SECRET:', CF_CLIENT_SECRET ? CF_CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');
    console.log('- CF_API_URL:', CF_API_URL || 'NOT SET (using default: https://sandbox.cashfree.com/pg)');

    if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
      console.error('Missing Cashfree credentials');
      return res.status(500).json({ 
        error: 'Cashfree credentials not configured' 
      });
    }

    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 5000;
    
    const checkPaymentStatus = async () => {
      attempts += 1;
      console.log(`=== PAYMENT STATUS CHECK - ATTEMPT ${attempts} ===`);
      
      try {
        console.log('Calling Cashfree API to check payment status...');
        console.log('Order ID:', orderId);
        
        const resp = await fetch(`${CF_API_URL || 'https://sandbox.cashfree.com/pg'}/orders/${orderId}`, {
          headers: {
            'Accept': 'application/json',
            'x-api-version': '2022-01-01',
            'x-client-id': CF_CLIENT_ID,
            'x-client-secret': CF_CLIENT_SECRET,
          },
        });
        
        console.log('=== CASHFREE RESPONSE ===');
        console.log('Status:', resp.status);
        console.log('Status Text:', resp.statusText);
        
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }

        const data = await resp.json();
        console.log('Response Data:', data);
        
        const status = (data?.order_status || "").toUpperCase();
        console.log('Payment Status:', status);
        
        if (status === "PAID") {
          console.log('=== PAYMENT SUCCESSFUL ===');
          
          // Return success response - frontend will handle Firestore creation
          return res.status(200).json({
            success: true,
            status: "PAID",
            message: "Payment verified successfully",
            orderId: orderId,
            data: data
          });
          
        } else if (status === "FAILED") {
          console.log('=== PAYMENT FAILED ===');
          return res.status(200).json({
            success: false,
            status: "FAILED",
            message: "Payment failed",
            orderId: orderId
          });
          
        } else if (status === "PENDING" && attempts < maxAttempts) {
          console.log(`=== PAYMENT PENDING - RETRYING IN 5 SECONDS ===`);
          console.log(`Attempt ${attempts}/${maxAttempts}, will retry...`);
          
          // For serverless functions, we need to handle retries differently
          // Return pending status and let frontend handle retries
          return res.status(200).json({
            success: false,
            status: "PENDING",
            message: "Payment still pending",
            orderId: orderId,
            attempts: attempts,
            maxAttempts: maxAttempts
          });
          
        } else {
          console.log('=== PAYMENT VERIFICATION TIMEOUT ===');
          return res.status(200).json({
            success: false,
            status: "TIMEOUT",
            message: "Payment verification timeout",
            orderId: orderId
          });
        }
        
      } catch (error) {
        console.error('=== PAYMENT VERIFICATION ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (attempts < maxAttempts) {
          console.log(`=== RETRYING VERIFICATION - ATTEMPT ${attempts}/${maxAttempts} ===`);
          // Return error with retry info
          return res.status(200).json({
            success: false,
            status: "ERROR",
            message: "Payment verification error",
            error: error.message,
            orderId: orderId,
            attempts: attempts,
            maxAttempts: maxAttempts
          });
        } else {
          console.log('=== MAX RETRY ATTEMPTS REACHED ===');
          return res.status(500).json({
            success: false,
            status: "MAX_RETRIES",
            message: "Payment verification failed after max retries",
            error: error.message,
            orderId: orderId
          });
        }
      }
    };
    
    console.log('=== STARTING PAYMENT STATUS CHECK ===');
    const result = await checkPaymentStatus();
    
  } catch (error) {
    console.error('=== VERIFY-PAYMENT FUNCTION CRASHED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}