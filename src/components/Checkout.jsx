import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";
const PG_HOST = import.meta.env.DEV ? "" : "https://sandbox.cashfree.com";

// NOTE: For testing only. Do NOT expose secrets in production.
const CLIENT_ID = import.meta.env.VITE_CASHFREE_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = import.meta.env.VITE_CASHFREE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";

const CF_BASE = "https://sandbox.cashfree.com/pg";

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
		const url = `${CF_BASE}/orders`; // Orders API also accepts basic auth with client_id and client_secret in headers
		return { url };
	};

	const createOrder = async () => {
		// Create order and fetch payment_session_id directly from frontend (testing only)
		const orderPayload = {
			order_amount: 5,
			order_currency: "INR",
			customer_details: {
				customer_id: `cust_${Date.now()}`,
				customer_phone: "9060048489",
			},
			order_meta: {
				return_url: `${window.location.origin}/cf-return.html?order_id={order_id}`,
			},
		};

		try {
			const { url } = await getAccessToken();
			const response = await axios.post(
				`${PG_HOST}/pg/orders`,
				orderPayload,
				{
					headers: {
						"Accept": "application/json",
						"x-api-version": "2023-08-01",
						"Content-Type": "application/json",
						"x-client-id": CLIENT_ID,
						"x-client-secret": CLIENT_SECRET,
					},
				}
			);
			return response?.data?.payment_session_id;
		} catch (err) {
			console.error("Cashfree order create error:", err?.response?.data || err?.message);
			setError(err?.response?.data?.message || "Failed to create order");
			return null;
		}
	};

	const handlePayNow = async () => {
		setError("");
		if (!cashfreeRef.current) {
			setError("Payment SDK not ready. Please retry.");
			return;
		}
		const paymentSessionId = await createOrder();
		if (!paymentSessionId) return;

		const checkoutOptions = {
			paymentSessionId,
			redirectTarget: "_self",
		};
		try {
			await cashfreeRef.current.checkout(checkoutOptions);
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