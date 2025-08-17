import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";
import newsList from "../../data/newsList.json";

const NewsList = () => {
	const items = Array.isArray(newsList) ? newsList : [];

	const getThumb = (item) => {
		const media = (item.subtitles || []).find(s => s.type === "image") || (item.subtitles || []).find(s => s.type === "video");
		if (!media) return null;
		if (media.type === "image") return <img src={media.content} alt={item.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />;
		return (
			<div style={{ background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
				<span>▶ Video</span>
			</div>
		);
	};

	return (
		<div style={{ padding: 24 }}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
				<h1 style={{ fontFamily: "Poppins, sans-serif" }}>News & Blogs</h1>
				<Link className="btn btn-secondary" to="/">← Back</Link>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
				{items.map((item) => (
					<Link key={item.id} to={`/news/${item.id}`} className="card" style={{ background: "#fff", borderRadius: 12, overflow: "hidden", textDecoration: "none" }}>
						{getThumb(item)}
						<div style={{ padding: 16 }}>
							<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8, color: "#111827" }}>{item.title}</h3>
							<div style={{ fontSize: 12, color: "#6B7280" }}>{new Date(item.publishedAt).toLocaleDateString()} • {item.author}</div>
							<div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
								{(item.tags || []).map(tag => (
									<span key={tag} className="btn btn-text" style={{ border: "1px solid #E5E7EB", borderRadius: 999, padding: "4px 10px", color: "#374151" }}>{tag}</span>
								))}
							</div>
						</div>
					</Link>
				))}
				{items.length === 0 && (
					<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
						<p>No news available.</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default NewsList; 