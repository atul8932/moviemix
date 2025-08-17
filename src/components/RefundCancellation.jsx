import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import Footer from "./Footer";

const RefundCancellation = () => {
	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>Refund & cancellation policy</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
				<h3>Eligibility</h3>
				<p>Refunds are considered for duplicate payments or service failures. Requests must be made within 7 days of payment.</p>
				<h3 style={{ marginTop: 16 }}>Process</h3>
				<p>Contact support with your order ID and payment receipt. Approved refunds are processed to the original payment method within 5–7 business days.</p>
				<h3 style={{ marginTop: 16 }}>Cancellations</h3>
				<p>Orders can be cancelled before processing begins. Once a download link is issued, cancellations are not possible.</p>
			</div>

			<Footer />
		</div>
	);
};

export default RefundCancellation; 