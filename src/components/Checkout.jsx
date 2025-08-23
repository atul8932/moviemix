import React, { useEffect, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

const Checkout = () => {
	const cashfreeRef = useRef(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState("");
	const [paying, setPaying] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const cashfree = await load({ mode: "production" });
				if (mounted) {
					cashfreeRef.current = cashfree;
				}
			} catch (e) {
				setError("Failed to initialize payment SDK.");
			} finally {
				if (mounted) setIsInitializing(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const handlePayNow = async () => {
		setError("");
		setPaying(true);
		try {
			if (!cashfreeRef.current) {
				throw new Error("Payment SDK not ready. Please retry.");
			}

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

			// Use Cashfree SDK with payment session ID from backend
			await cashfreeRef.current.checkout({
				paymentSessionId: paymentData.payment_session_id,
				redirectTarget: "_self",
				appearance: {
					primaryColor: "#6366f1"
				}
			});
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
				disabled={isInitializing || paying}
				className="btn btn-primary"
				style={{ minWidth: 160 }}
			>
				{isInitializing ? "Initializing..." : paying ? "Processing..." : "Pay Now"}
			</button>
		</div>
	);
};

export default Checkout; 