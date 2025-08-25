# Moving Payment Verification to Separate File

## Overview
This document outlines the completed refactoring of payment verification logic from `src/components/Dashboard.jsx` into the existing API file `api/verify-payment.js`. The system now has improved code organization, reusability, and maintainability.

## Current State

### Location: `src/components/Dashboard.jsx`
The payment verification logic is currently embedded within a `useEffect` hook in the Dashboard component:

```javascript
// After returning from Cashfree, verify payment status
useEffect(() => {
  const verifyAndCreateRequest = async () => {
    try {
      const pendingStr = localStorage.getItem("cfPendingOrder");
      if (!pendingStr || !user?.email) return;
      
      const pending = JSON.parse(pendingStr);
      if (!pending?.orderId) return;

      let attempts = 0;
      const checkPaymentStatus = async () => {
        attempts += 1;
        try {
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
          
          if (status === "PAID") {
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
            
            localStorage.removeItem("cfPendingOrder");
            setPaymentStatusInfo({ state: "success", message: "Payment verified! Movie request created." });
          } else if (status === "FAILED") {
            localStorage.removeItem("cfPendingOrder");
            setPaymentStatusInfo({ state: "error", message: "Payment failed. Please try again." });
          } else if (status === "PENDING" && attempts < 5) {
            setTimeout(checkPaymentStatus, 5000);
          } else {
            localStorage.removeItem("cfPendingOrder");
            setPaymentStatusInfo({ state: "error", message: "Payment verification timeout. Please contact support." });
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          if (attempts < 5) {
            setTimeout(checkPaymentStatus, 5000);
          } else {
            localStorage.removeItem("cfPendingOrder");
            setPaymentStatusInfo({ state: "error", message: "Payment verification failed. Please contact support." });
          }
        }
      };
      
      checkPaymentStatus();
    } catch (error) {
      console.error("Error in payment verification:", error);
    }
  };

  verifyAndCreateRequest();
}, [user?.email]);
```

## Target State

### Existing File: `api/verify-payment.js`
The payment verification serverless function already exists and follows the same style as `create-payment.js`:

```javascript
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
        
        const resp = await fetch(`${process.env.CF_API_URL || 'https://sandbox.cashfree.com/pg'}/orders/${orderId}`, {
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

// All utility functions removed - not needed with serverless function approach
```

## Refactoring Steps

### Step 1: Verify the API File Exists
```bash
# File already exists in api/verify-payment.js
# No need to create it
ls api/verify-payment.js
```

### Step 2: Logic Already Moved
The verification logic is already implemented in the existing `api/verify-payment.js` file.

### Step 3: Dashboard.jsx Already Updated
The Dashboard.jsx has already been updated to use the API endpoint, following the same style as `handleRequestSubmit`:

```javascript
// src/components/Dashboard.jsx
// No imports needed - using fetch API directly like handleRequestSubmit

// ... existing code ...

// After returning from Cashfree, verify payment status
useEffect(() => {
  const verifyAndCreateRequest = async () => {
    try {
      console.log('=== PAYMENT VERIFICATION USE EFFECT TRIGGERED ===');
      console.log('User email:', user?.email);
      console.log('User authenticated:', !!user);
      
      // Check localStorage directly like handleRequestSubmit
      const pendingStr = localStorage.getItem("cfPendingOrder");
      if (!pendingStr || !user?.email) {
        console.log('No pending payment or user email, skipping verification');
        return;
      }
      
      const pending = JSON.parse(pendingStr);
      if (!pending?.orderId) {
        console.log('No order ID in pending order, skipping verification');
        return;
      }

      console.log('=== STARTING PAYMENT VERIFICATION ===');
      console.log('Pending order details:', pending);
      console.log('User email:', user.email);
      
      // Call the API function with the same pattern as handleRequestSubmit
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: pending.orderId,
          userEmail: user.email,
          orderDetails: pending
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Payment verification result:', result);
      
      // Handle the API response based on status
      if (result.success && result.status === "PAID") {
        console.log('=== PAYMENT VERIFIED - CREATING MOVIE REQUEST ===');
        
        // Create movie request in Firestore
        try {
          const movieRequest = {
            mobile: pending.mobile,
            movieName: pending.movie,
            language: pending.language,
            email: user.email,
            createdAt: serverTimestamp(),
            status: "pending",
            orderId: pending.orderId,
            paymentStatus: "paid"
          };
          
          console.log('Movie request data:', movieRequest);
          
          const docRef = await addDoc(collection(db, "movieRequests"), movieRequest);
          console.log('Movie request created successfully:', docRef.id);
          
          localStorage.removeItem("cfPendingOrder");
          setPaymentStatusInfo({ 
            state: "success", 
            message: "Payment verified! Movie request created." 
          });
          
        } catch (firestoreError) {
          console.error('=== FIRESTORE ERROR ===');
          console.error('Error creating movie request:', firestoreError);
          setPaymentStatusInfo({ 
            state: "error", 
            message: "Payment verified but failed to create movie request. Please contact support." 
          });
        }
        
      } else if (result.status === "FAILED") {
        console.log('=== PAYMENT FAILED ===');
        localStorage.removeItem("cfPendingOrder");
        setPaymentStatusInfo({ 
          state: "error", 
          message: "Payment failed. Please try again." 
        });
        
      } else if (result.status === "PENDING") {
        console.log('=== PAYMENT PENDING ===');
        setPaymentStatusInfo({ 
          state: "pending", 
          message: `Payment still pending... (Attempt ${result.attempts}/${result.maxAttempts})` 
        });
        
        // Frontend will handle retries by calling this function again
        if (result.attempts < result.maxAttempts) {
          setTimeout(() => verifyAndCreateRequest(), 5000);
        }
        
      } else {
        console.log('=== UNKNOWN PAYMENT STATUS ===');
        setPaymentStatusInfo({ 
          state: "error", 
          message: result.message || "Payment verification failed. Please contact support." 
        });
      }

    } catch (error) {
      console.error("=== PAYMENT VERIFICATION CRASHED ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error object:", error);
      
      setPaymentStatusInfo({ 
        state: "error", 
        message: "Payment verification failed. Please contact support." 
      });
    }
  };

  verifyAndCreateRequest();
}, [user?.email]);
```

## Benefits of This Refactoring

### 1. **Separation of Concerns**
- Dashboard component focuses on UI and user interaction
- Payment verification logic is isolated and testable
- Business logic separated from presentation logic

### 2. **Reusability**
- Verification logic can be used in other components
- Easy to import and use in different parts of the application
- Consistent payment verification across the app

### 3. **Maintainability**
- Single source of truth for payment verification
- Easier to update verification logic
- Better error handling and logging

### 4. **Testability**
- Unit tests can be written for verification logic
- Mock dependencies easily
- Isolated testing of business logic

### 5. **Configuration Management**
- Centralized configuration for verification parameters
- Easy to adjust retry attempts, delays, and endpoints
- Environment-specific configurations

## Testing the Refactored Code

### 1. **Integration Tests**
Test the complete flow from Dashboard to verification API.

### 2. **Manual Testing**
- Test payment flow in development
- Verify error handling
- Check retry mechanism

## Migration Checklist

- [x] `api/verify-payment.js` already exists
- [x] Verification logic already in API file
- [x] Dashboard.jsx updated to use API file
- [ ] Test payment flow in development
- [ ] Update imports and dependencies
- [ ] Add error handling and logging
- [ ] Test error scenarios
- [ ] Update documentation
- [ ] Deploy and test in production

## Rollback Plan

If issues arise during migration:

1. **Keep original code** in a backup branch
2. **Gradual migration** - test thoroughly before full deployment
3. **Feature flags** - ability to switch between old and new logic
4. **Monitoring** - watch for errors after deployment

## Future Enhancements

### 1. **Webhook Integration**
Replace polling with real-time webhook updates from Cashfree.

### 2. **Advanced Retry Logic**
Implement exponential backoff and circuit breaker patterns.

### 3. **Payment Analytics**
Track verification success rates and performance metrics.

### 4. **Caching**
Cache payment status to reduce API calls.

### 5. **Queue System**
Implement background job processing for payment verification.

---

*This refactoring improves code organization and makes the payment verification system more robust and maintainable.* 