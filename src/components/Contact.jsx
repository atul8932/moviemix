import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";
import Footer from "./Footer";

const Contact = () => {
	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>Contact us</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
				<p>If you have any questions, feedback, or need support, please reach out:</p>
				<ul style={{ marginTop: 12, marginLeft: 18 }}>
					<li>Email: 9386918793ak@gmail.com</li>
					<li>Phone: +91 6207232718</li>
				</ul>
				<p style={{ marginTop: 16 }}>We typically respond within 24–48 hours.</p>
			</div>

			<Footer />
		</div>
	);
};

export default Contact; 