import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const Privacy = () => {
	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>Privacy Policy</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
				<h3>Information we collect</h3>
				<p>We collect information you provide (like name, email) and usage data to improve the service.</p>
				<h3 style={{ marginTop: 16 }}>How we use data</h3>
				<p>Your data is used to provide and enhance features, support, and security. We do not sell your personal data.</p>
				<h3 style={{ marginTop: 16 }}>Your choices</h3>
				<p>You may request access, correction, or deletion of your data by contacting us.</p>
			</div>
		</div>
	);
};

export default Privacy; 