# MovieMix Payment Flow Documentation

## Overview
This document describes the complete payment flow for requesting movies in the MovieMix application, including Cashfree integration, order creation, payment processing, and post-payment verification.

## Architecture

### Frontend (React + Vite)
- **Port**: 5173 (development)
- **Framework**: React with functional components and hooks
- **State Management**: React useState, useEffect, useRef

### Backend (Vercel Serverless Functions)
- **Port**: 3000 (development)
- **Runtime**: Node.js
- **Deployment**: Vercel

### Payment Gateway
- **Provider**: Cashfree Payments
- **Environment**: Sandbox (development) / Production (live)
- **SDK**: @cashfreepayments/cashfree-js

## Payment Flow Diagram

```
User clicks "Request Movie" 
    ↓
Frontend validates form data
    ↓
Frontend calls /api/create-payment
    ↓
Backend creates Cashfree order
    ↓
Cashfree returns payment_session_id
    ↓
Frontend launches Cashfree checkout
    ↓
User completes payment on Cashfree
    ↓
Cashfree redirects back to app
    ↓
Frontend verifies payment status
    ↓
If PAID: Create movie request in Firestore
If FAILED: Show error message
```

## Detailed Flow Breakdown

### 1. User Initiates Payment

**Location**: `src/components/Dashboard.jsx` - `handleRequestSubmit` function

**Trigger**: User fills movie request form and clicks "Request Movie" button

**Form Data**:
```javascript
{
  mobile: "9060048489",
  movie: "Movie Name",
  language: "english",
  email: "user@example.com"
}
```

**Validation**:
- Mobile number required
- Movie name required
- Language selection required
- User must be authenticated

### 2. Frontend API Call

**URL**: `${API_BASE}/api/create-payment`

**Method**: POST

**Headers**:
```javascript
{
  'Content-Type': 'application/json'
}
```

**Body**:
```javascript
{
  orderAmount: 6, // Fixed amount for testing
  customerPhone: mobile,
  customerEmail: user?.email || `customer_${Date.now()}@example.com`,
  returnUrl: `${APP_BASE_URL}#/dashboard`
}
```

**Environment Detection**:
```javascript
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:3000'  // Vercel dev server
  : window.location.origin;  // Production - same domain
```

### 3. Backend Order Creation

**Location**: `api/create-payment.js`

**Process**:
1. **Validate request** - Check method, headers, body
2. **Load credentials** - Get Cashfree credentials from environment variables
3. **Create order payload** - Format data for Cashfree API
4. **Call Cashfree** - POST to `/pg/orders` endpoint
5. **Process response** - Extract payment details
6. **Return data** - Send payment information to frontend

**Cashfree API Call**:
```javascript
const cashfreeUrl = (process.env.CF_API_URL || 'https://sandbox.cashfree.com/pg') + '/orders';

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
```

**Order Payload**:
```javascript
{
  order_amount: parseFloat(orderAmount),
  order_currency: "INR",
  customer_details: {
    customer_id: "bpaagIWG4lMSrIpO92vtIc5A3w23",
    customer_phone: customerPhone,
  },
  order_meta: {
    return_url: returnUrl || (req.headers.origin || "http://localhost:5173") + "#/dashboard"
  }
}
```

### 4. Cashfree Response Processing

**Success Response**:
```javascript
{
  "cf_order_id": 2196166583,
  "order_id": "order_1076540731gzstZfN24u1HDHEaTNw37UdhT",
  "order_token": "jahWS5cOUn5OCvyoonGi",
  "payment_link": "https://sandbox.cashfree.com/pg/view/sessions/checkout/web/jahWS5cOUn5OCvyoonGi",
  "order_status": "ACTIVE"
}
```

**Frontend Response**:
```javascript
{
  success: true,
  order_id: data.order_id,
  payment_session_id: data.payment_session_id || data.order_token,
  order_amount: data.order_amount,
  cashfree_order_id: data.cf_order_id,
  payment_link: data.payment_link
}
```

### 5. Frontend Payment Launch

**Location**: `src/components/Dashboard.jsx` - After successful API response

**Process**:
1. **Store pending order** - Save order details in localStorage
2. **Launch checkout** - Use Cashfree SDK or fallback to payment link

**SDK Method**:
```javascript
if (cashfreeRef.current) {
  cashfreeRef.current.checkout({
    paymentSessionId: data.payment_session_id,
    redirectTarget: "_self"
  });
}
```

**Fallback Method**:
```javascript
window.open(data.payment_link, '_self');
```

**Pending Order Storage**:
```javascript
localStorage.setItem("cfPendingOrder", JSON.stringify({
  orderId: data.order_id,
  mobile: mobile,
  movie: movie,
  language: language,
  timestamp: Date.now()
}));
```

### 6. User Payment Completion

**Process**:
1. User redirected to Cashfree hosted checkout page
2. User selects payment method (UPI, cards, net banking, etc.)
3. User completes payment
4. Cashfree redirects back to return URL

**Return URL**: `${APP_BASE_URL}#/dashboard`

### 7. Post-Payment Verification

**Location**: `src/components/Dashboard.jsx` - `useEffect` for payment verification

**Trigger**: Component mounts after returning from Cashfree

**Process**:
1. **Check localStorage** - Look for pending order
2. **Verify payment status** - Call Cashfree API to check order status
3. **Process result** - Handle different payment statuses

**Payment Status Check**:
```javascript
const resp = await fetch(`${PG_BASE}/orders/${pending.orderId}`, {
  headers: {
    'Accept': 'application/json',
    'x-api-version': '2022-01-01',
    'x-client-id': CF_CLIENT_ID,
    'x-client-secret': CF_CLIENT_SECRET,
  },
});

const data = await resp.json();
const status = (data?.order_status || "").toUpperCase();
```

**Status Handling**:
- **PAID**: Create movie request in Firestore, clear localStorage
- **FAILED**: Show error message, clear localStorage
- **PENDING**: Retry verification (with exponential backoff)

### 8. Firestore Integration

**Location**: After successful payment verification

**Process**:
```javascript
await addDoc(collection(db, "movieRequests"), {
  mobile: pending.mobile,
  movieName: pending.movie,
  language: pending.language,
  email: user.email,
  createdAt: serverTimestamp(),
  status: "pending",
  orderId: pending.orderId,
  paymentStatus: "paid"
});
```

**Collection**: `movieRequests`

**Document Structure**:
```javascript
{
  mobile: "9060048489",
  movieName: "Movie Name",
  language: "english",
  email: "user@example.com",
  createdAt: Timestamp,
  status: "pending",
  orderId: "order_1076540731gzstZfN24u1HDHEaTNw37UdhT",
  paymentStatus: "paid"
}
```

## Environment Configuration

### Local Development

**Frontend (.env.local)**:
```bash
VITE_CASHFREE_CLIENT_ID=TEST107654...
VITE_CASHFREE_CLIENT_SECRET=cfsk_ma_te...
VITE_DEV_CASHFREE_URL=https://sandbox.cashfree.com/pg
```

**Backend (.env)**:
```bash
CF_CLIENT_ID=TEST107654...
CF_CLIENT_SECRET=cfsk_ma_te...
CF_API_URL=https://sandbox.cashfree.com/pg
```

### Production

**Vercel Dashboard Environment Variables**:
```bash
CF_CLIENT_ID=PRODUCTION_CLIENT_ID
CF_CLIENT_SECRET=PRODUCTION_CLIENT_SECRET
CF_API_URL=https://api.cashfree.com/pg
```

## Error Handling

### Frontend Errors

**Payment Creation Failed**:
```javascript
catch (error) {
  console.error('=== PAYMENT ERROR ===');
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Full error object:', error);
  
  setPayError(`Payment failed: ${error.message}`);
  setPaying(false);
}
```

**SDK Initialization Failed**:
```javascript
catch (e) {
  console.error("Cashfree init failed", e);
  console.error("Error details:", e.message);
  console.error("Error stack:", e.stack);
}
```

### Backend Errors

**Missing Credentials**:
```javascript
if (!CF_CLIENT_ID || !CF_CLIENT_SECRET) {
  console.error('Missing Cashfree credentials');
  return res.status(500).json({ 
    error: 'Cashfree credentials not configured' 
  });
}
```

**Cashfree API Errors**:
```javascript
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
```

## Security Considerations

### Frontend
- **No sensitive data** stored in frontend
- **Environment variables** prefixed with `VITE_` for public access
- **User authentication** required before payment

### Backend
- **Credentials stored** in environment variables
- **CORS headers** configured for cross-origin requests
- **Input validation** on all incoming requests
- **Error messages** sanitized to prevent information leakage

### Payment Gateway
- **HTTPS only** for all API calls
- **API versioning** specified in headers
- **Request signing** handled by Cashfree SDK

## Testing

### Local Testing
1. **Start Vercel dev server**: `npx vercel dev`
2. **Start Vite dev server**: `npm run dev`
3. **Test payment flow** with sandbox credentials
4. **Monitor console logs** for debugging

### Production Testing
1. **Deploy to Vercel**: `git push origin main`
2. **Set production environment variables**
3. **Test with production credentials**
4. **Monitor Vercel function logs**

## Monitoring and Logging

### Frontend Logging
- **Console logs** for debugging
- **Error boundaries** for crash handling
- **User feedback** for payment status

### Backend Logging
- **Function execution** logs
- **API call details** (URL, headers, payload)
- **Response processing** logs
- **Error details** with stack traces

### Vercel Logs
- **Function execution** logs
- **Error tracking** and monitoring
- **Performance metrics**

## Troubleshooting

### Common Issues

**1. 404 Not Found**
- **Cause**: Frontend calling wrong API URL
- **Solution**: Check `API_BASE` configuration

**2. 401 Unauthorized**
- **Cause**: Missing or invalid Cashfree credentials
- **Solution**: Verify environment variables

**3. "no Route matched"**
- **Cause**: Wrong Cashfree API URL
- **Solution**: Check `CF_API_URL` environment variable

**4. SDK Initialization Failed**
- **Cause**: Network issues or invalid configuration
- **Solution**: Check internet connection and SDK configuration

**5. Payment Verification Failed**
- **Cause**: Order ID mismatch or API errors
- **Solution**: Check localStorage and API responses

### Debug Steps

1. **Check browser console** for frontend errors
2. **Check Vercel logs** for backend errors
3. **Verify environment variables** are set correctly
4. **Test API endpoints** with curl or Postman
5. **Check network tab** for failed requests

## Future Enhancements

### Planned Features
- **Webhook integration** for real-time payment updates
- **Payment retry mechanism** for failed payments
- **Advanced error handling** with user-friendly messages
- **Payment analytics** and reporting
- **Multi-currency support**

### Technical Improvements
- **Rate limiting** for API calls
- **Request caching** for better performance
- **Circuit breaker pattern** for external API calls
- **Enhanced logging** with structured data
- **Performance monitoring** and alerting

## Support and Maintenance

### Documentation Updates
- **Keep this document** updated with code changes
- **Add new features** and error scenarios
- **Update troubleshooting** section based on issues

### Code Maintenance
- **Regular dependency updates** for security
- **Code reviews** for payment-related changes
- **Testing** of payment flow after updates
- **Monitoring** of production payment success rates

---

*Last Updated: August 23, 2025*
*Version: 1.0*
*Maintainer: Development Team* 