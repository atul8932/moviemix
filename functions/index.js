const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

const rzp = new Razorpay({
  key_id: (functions.config().rzp && functions.config().rzp.key_id) || process.env.RZP_KEY_ID,
  key_secret: (functions.config().rzp && functions.config().rzp.key_secret) || process.env.RZP_KEY_SECRET,
});

exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const { amount, currency = "INR", requestId, mobile } = data || {};
    if (!amount || !requestId) {
      throw new functions.https.HttpsError("invalid-argument", "Missing amount or requestId");
    }

    const order = await rzp.orders.create({ amount, currency, notes: { requestId, mobile } });
    return { orderId: order.id, amount: order.amount, key: process.env.RZP_KEY_ID };
  } catch (e) {
    console.error(e);
    throw new functions.https.HttpsError("internal", e.message);
  }
});

exports.verifyPayment = functions.https.onCall(async (data, context) => {
  try {
    const { requestId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = data || {};
    if (!requestId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new functions.https.HttpsError("invalid-argument", "Missing verification fields");
    }

    const expected = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const isValid = expected === razorpay_signature;

    const ref = admin.firestore().collection("movieRequests").doc(requestId);
    await ref.update({ paymentStatus: isValid ? "success" : "failed" });

    return { ok: true, verified: isValid };
  } catch (e) {
    console.error(e);
    throw new functions.https.HttpsError("internal", e.message);
  }
}); 