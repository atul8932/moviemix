import React, { useState } from "react";
// Removed Cashfree SDK to avoid PaymentJSInterface errors - using direct links

const Checkout = () => {
	const [error, setError] = useState("");
	const [paying, setPaying] = useState(false);

	const handlePayNow = async () => {
		setError("");
		setPaying(true);
		try {
			// No SDK check needed - using direct payment links

			// Create payment order via our backend API
			const paymentRequest = {
				orderAmount: 5,
				customerPhone: "9060048489",
				customerEmail: "test@example.com",
				returnUrl: `${window.location.origin}/checkout`
			};

			const response = await fetch('/api/create-payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(paymentRequest)
			});

			const paymentData = await response.json();

			if (!paymentData.success) {
				throw new Error(paymentData.error || 'Failed to create payment order');
			}

			// Use direct payment link for reliable redirection
			if (paymentData.payment_link) {
				console.log("Redirecting to payment:", paymentData.payment_link);
				window.location.href = paymentData.payment_link;
			} else {
				throw new Error("No payment link available");
			}
		} catch (e) {
			console.error("Checkout failed:", e);
			setError(e.message || "Checkout failed. Please try again.");
		} finally {
			setPaying(false);
		}
	};

	return (
		<div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
			<h2>Cashfree Checkout</h2>
			<p>Click below to open the checkout page in current tab.</p>
			{error && (
				<div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>
			)}
			<button
				onClick={handlePayNow}
				disabled={paying}
				className="btn btn-primary"
				style={{ minWidth: 160 }}
			>
				{paying ? "Processing..." : "Pay Now"}
			</button>
		</div>
	);
};

export default Checkout; 