# MovieMix

## Payments (Razorpay Orders + Firebase Functions)

- Set environment variables in Firebase Functions:
  - `RZP_KEY_ID`
  - `RZP_KEY_SECRET`
  - `RZP_WEBHOOK_SECRET` (optional for webhook)

- Deploy functions after creating the `functions/` folder with code:
  ```bash
  cd functions
  npm i
  # set envs in your host (or use Firebase config)
  cd ..
  firebase deploy --only functions
  ```

- Frontend will call `createOrder` and `verifyPayment` callable functions.
