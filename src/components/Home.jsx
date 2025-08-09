import React, { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Home = () => {
  const [mobile, setMobile] = useState("");
  const [movie, setMovie] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const paymentRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (movie.trim() && mobile.trim()) {
      try {
        await addDoc(collection(db, "movieRequests"), {
          mobile,
          movieName: movie,
          createdAt: serverTimestamp(),
          status: "pending",
          downloadLink: ""
        });
        setShowPayment(true);
      } catch (err) {
        console.error("Error saving movie request:", err);
      }
    }
  };

  useEffect(() => {
    if (showPayment && paymentRef.current) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/payment-button.js";
      script.setAttribute("data-payment_button_id", "pl_R1CZMVUMb9phyL");
      script.async = true;
      paymentRef.current.appendChild(script);

      // For testing without actual payment:
      const handlePaymentSuccess = () => {
        navigate(`/waiting/${mobile}`);
      };
      setTimeout(handlePaymentSuccess, 3000);
    }
  }, [showPayment, mobile, navigate]);

  return (
    <div className="home-container">
      <h1 className="title">MovieMix</h1>
      {!showPayment ? (
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
      ) : (
        <div ref={paymentRef}></div>
      )}
    </div>
  );
};

export default Home;
