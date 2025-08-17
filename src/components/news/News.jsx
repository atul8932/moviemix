import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import newsData from "../../data/news.json";

const News = () => {
	const data = newsData || { title: "News & Blogs", subtitles: [] };
	const items = Array.isArray(data.subtitles) ? data.subtitles : [];

	const renderItem = (item, idx) => {
		switch (item.type) {
			case "video":
				return (
					<div key={idx} className="card" style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
						<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>{item.subtitle}</h3>
						<p style={{ marginBottom: 12 }}>{item.description}</p>
						<div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
							<iframe
								src={item.content}
								title={item.subtitle}
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowFullScreen
								style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
							/>
						</div>
					</div>
				);
			case "image":
				return (
					<div key={idx} className="card" style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
						<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>{item.subtitle}</h3>
						<p style={{ marginBottom: 12 }}>{item.description}</p>
						<div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
							<img src={item.content} alt={item.subtitle} style={{ width: "100%", height: "auto", display: "block" }} />
						</div>
					</div>
				);
			case "bot":
			default:
				return (
					<div key={idx} className="card" style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
						<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>{item.subtitle}</h3>
						<p style={{ marginBottom: 12 }}>{item.description}</p>
						<div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
							<span style={{ opacity: 0.7 }}>🤖</span>
							<span style={{ marginLeft: 8 }}>{item.content}</span>
						</div>
					</div>
				);
		}
	};

	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>News & Blogs</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 16 }}>
				<h2 style={{ fontFamily: "Poppins, sans-serif", margin: 0 }}>{data.title}</h2>
			</div>

			<div>
				{items.map((it, idx) => renderItem(it, idx))}
				{items.length === 0 && (
					<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
						<p>No news or blogs available.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default News; 