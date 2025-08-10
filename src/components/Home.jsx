import React, { useState } from "react";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

const Home = () => {
  const [mobile, setMobile] = useState("");
  const [movie, setMovie] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (movie.trim() && mobile.trim()) {
      try {
        const docRef = await addDoc(collection(db, "movieRequests"), {
          mobile,
          movieName: movie,
          createdAt: serverTimestamp(),
          status: "pending",
          paymentStatus: "pending",
          downloadLink: "",
        });
        await startPaymentFlow(docRef.id, mobile);
      } catch (err) {
        console.error("Error saving movie request:", err);
      }
    }
  };

  const startPaymentFlow = async (createdRequestId, mobileNumber) => {
    try {
      await loadRazorpayScript();

      const createOrder = httpsCallable(functions, "createOrder");
      const resp = await createOrder({ amount: 4900, currency: "INR", requestId: createdRequestId, mobile: mobileNumber });
      const { orderId, amount, key } = resp.data;

      const options = {
        key,
        order_id: orderId,
        amount,
        currency: "INR",
        name: "MovieMix",
        description: "Movie request payment",
        notes: { requestId: createdRequestId, mobile: mobileNumber },
        handler: async function (response) {
          try {
            const verifyPayment = httpsCallable(functions, "verifyPayment");
            await verifyPayment({
              requestId: createdRequestId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (error) {
            console.error("Payment verification failed:", error);
          } finally {
            navigate(`/waiting/${mobileNumber}`);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await updateDoc(doc(db, "movieRequests", createdRequestId), { paymentStatus: "cancelled" });
            } finally {
              navigate(`/waiting/${mobileNumber}`);
            }
          },
        },
        prefill: { contact: mobileNumber },
        theme: { color: "#0ea5e9" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Failed to start payment flow:", error);
    }
  };

  return (
    <div className="home-container">
      <h1 className="title">MovieMix</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-box"
          placeholder="Enter mobile number..."
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <input
          type="text"
          className="input-box"
          placeholder="Enter movie name..."
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
        />
        <button type="submit" className="btn primary">
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default Home;
