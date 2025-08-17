import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import Footer from "./Footer";

const Terms = () => {
	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>Terms & conditions</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
				<h3>Use of Service</h3>
				<p>By accessing and using MovieHub, you agree to comply with these terms. You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
				<h3 style={{ marginTop: 16 }}>Content Policy</h3>
				<p>Content provided is for personal use only. Do not redistribute or use content for commercial purposes without permission.</p>
				<h3 style={{ marginTop: 16 }}>Liability</h3>
				<p>Service is provided on an "as is" basis without warranties of any kind. We are not liable for any indirect or consequential damages.</p>
			</div>

			<Footer />
		</div>
	);
};

export default Terms; 