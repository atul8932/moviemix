import React from "react";

function PaymentPage() {
  const makePayment = async () => {
    try {
      const res = await fetch("http://localhost:5000/create-payment", {
        method: "POST",
      });
      const data = await res.json();

      if (data && data.payment_session_id) {
        const cashfree = new window.Cashfree({
          mode: "sandbox", // change to "production" later
        });

        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self",
        });
      } else {
        alert("Failed to start payment.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Pay ₹5 to Continue</h1>
      <button
        onClick={makePayment}
        className="px-6 py-3 mt-4 bg-blue-600 text-white rounded-lg"
      >
        Pay Now
      </button>
    </div>
  );
}

export default PaymentPage;
