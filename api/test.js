export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ 
    message: 'API is working!',
    env: {
      hasClientId: !!process.env.VITE_CASHFREE_CLIENT_ID,
      hasClientSecret: !!process.env.VITE_CASHFREE_CLIENT_SECRET
    },
    method: req.method
  });
}