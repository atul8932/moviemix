import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";

const CLIENT_ID = import.meta.env.VITE_CASHFREE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = import.meta.env.VITE_CASHFREE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";

const Checkout = () => {
	const cashfreeRef = useRef(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const cashfree = await load({ mode: "sandbox" });
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

	const getAccessToken = async () => {
		// OAuth token for Cashfree PG APIs
		const url = 'https://sandbox.cashfree.com/pg/orders'; // Orders API also accepts basic auth with client_id and client_secret in headers
		return { url };
	};

	const createOrder = async () => {
		// Use Cashfree Drop flow - no API calls needed
		const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
		
		const dropPayload = {
			orderId: orderId,
			orderAmount: 6,
			orderCurrency: "INR",
			customerName: "Test Customer",
			customerEmail: "test@example.com", 
			customerPhone: "9060048489",
			returnUrl: `${window.location.origin}`,
			notifyUrl: `${window.location.origin}`,
			paymentModes: "cc,dc,nb,paypal,upi",
		};

		// Create and submit form for Cashfree Drop Flow
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = 'https://test.cashfree.com/billpay/checkout/post/submit';
		form.style.display = 'none';

		// Add form fields
		const fields = {
			appId: CLIENT_ID,
			orderId: dropPayload.orderId,
			orderAmount: dropPayload.orderAmount,
			orderCurrency: dropPayload.orderCurrency,
			customerName: dropPayload.customerName,
			customerEmail: dropPayload.customerEmail,
			customerPhone: dropPayload.customerPhone,
			returnUrl: dropPayload.returnUrl,
			notifyUrl: dropPayload.notifyUrl,
			paymentModes: dropPayload.paymentModes
		};

		Object.keys(fields).forEach(key => {
			const input = document.createElement('input');
			input.type = 'hidden';
			input.name = key;
			input.value = fields[key];
			form.appendChild(input);
		});

		document.body.appendChild(form);
		form.submit();
		return null; // Will redirect, so return value not needed
	};

	const handlePayNow = async () => {
		setError("");
		try {
			await createOrder(); // This will redirect to Cashfree
		} catch (e) {
			console.error("Checkout failed:", e);
			setError("Checkout failed. Please try again.");
		}
	};

	return (
		<div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
			<h2>Cashfree Checkout (Sandbox)</h2>
			<p>Click below to open the checkout page in current tab.</p>
			{error && (
				<div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>
			)}
			<button
				onClick={handlePayNow}
				disabled={isInitializing}
				className="btn btn-primary"
				style={{ minWidth: 160 }}
			>
				{isInitializing ? "Initializing..." : "Pay Now"}
			</button>
			<div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
				For testing only. Do not expose secrets in production.
			</div>
		</div>
	);
};

export default Checkout; 