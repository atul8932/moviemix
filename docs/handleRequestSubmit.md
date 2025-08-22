# handleRequestSubmit — Movie Request + Cashfree Checkout

- Location: `src/components/Dashboard.jsx`
- Purpose: Initiates a Cashfree payment session for a movie request and defers Firestore creation until payment is confirmed.

## Preconditions
- User is authenticated.
- Fields `mobile`, `movie`, `language` are non-empty.
- Cashfree SDK is initialized in sandbox mode.
- Environment variables set:
  - `VITE_CASHFREE_CLIENT_ID`
  - `VITE_CASHFREE_CLIENT_SECRET`
- Domain whitelisted in Cashfree (local: `http://localhost:5173`, staging: your domain).

## High-level Flow
1. Prevent default form submit; clear previous errors; set submitting state.
2. Validate the Cashfree SDK is ready.
3. Build `orderPayload`:
   - `order_amount: 5`, `order_currency: "INR"`
   - `customer_details`: `{ customer_id: user.uid || "cust_<timestamp>", customer_phone: mobile }`
   - `order_meta.return_url`: `${window.location.origin}/cf-return.html?order_id={order_id}` (shim forwards to `/#/dashboard`).
4. Create order via `POST {PG_HOST}/pg/orders` with headers:
   - `Accept: application/json`
   - `x-api-version: 2023-08-01`
   - `Content-Type: application/json`
   - `x-client-id`, `x-client-secret`
5. Retrieve `order_id` and `payment_session_id` (fallback `order_token`).
6. Persist pending context to `localStorage`:
   ```json
   {
     "orderId": "<order_id>",
     "mobile": "<form mobile>",
     "movie": "<form movie>",
     "language": "<form language>"
   }
   ```
7. Launch checkout:
   ```js
   cashfree.checkout({ paymentSessionId, redirectTarget: "_self" })
   ```

## Post-payment Verification (Effect)
On dashboard load/return:
- Read `cfPendingOrder` from `localStorage`.
- Call `GET {PG_HOST}/pg/orders/{orderId}` with the same auth headers as above.
- Handle status:
  - `PAID`: create a Firestore doc in `movieRequests` with `paymentStatus: "success"`, then clear `cfPendingOrder`.
  - `PENDING/ACTIVE`: show pending message and poll up to ~30 seconds.
  - `FAILED/CANCELLED/EXPIRED`: clear `cfPendingOrder`, show failure message, do not create a request.

## Side Effects
- Navigates to Cashfree hosted checkout.
- Writes and clears `localStorage.cfPendingOrder`.
- Updates UI state: `paying`, `payError`, `paymentStatusInfo`.

## Environment Switching
- Local dev uses Vite proxy: `/pg/...` → sandbox host (configured in `vite.config.js`).
- Staging/production use absolute base via `PG_HOST = "https://sandbox.cashfree.com"` (or production base when live).

## Security Notes
- The client-side order creation is for sandbox testing only. In production, move `POST /pg/orders` and verification to your backend. 