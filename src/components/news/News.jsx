import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles.css";
import singleNews from "../../data/news.json";
import newsList from "../../data/newsList.json";
import Footer from "../Footer";

const News = () => {
	const { id } = useParams();
	const article = useMemo(() => {
		const list = Array.isArray(newsList) ? newsList : [];
		const found = list.find(n => n.id === id);
		if (found) return found;
		return singleNews && !id ? singleNews : null;
	}, [id]);

	if (!article) {
		return (
			<div style={{ padding: 24 }}>
				<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
					<p>Article not found.</p>
					<Link className="btn btn-secondary" to="/news">← Back to News</Link>
				</div>
			</div>
		);
	}

	const data = article;
	const items = Array.isArray(data.subtitles) ? data.subtitles : [];
	const firstItem = items[0];
	const pageUrl = typeof window !== "undefined" ? window.location.href : "";
	const publishedAt = data.publishedAt ? new Date(data.publishedAt).toLocaleString() : new Date().toLocaleString();
	const author = data.author || "Editorial Desk";

	const renderMedia = (item) => {
		if (!item) return null;
		if (item.type === "video") {
			return (
				<div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "#000" }}>
					<iframe
						src={item.content}
						title={item.subtitle}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
					/>
				</div>
			);
		}
		if (item.type === "image") {
			return (
				<figure style={{ margin: 0 }}>
					<div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-md)", background: "#fff" }}>
						<img src={item.content} alt={item.subtitle} style={{ width: "100%", height: "auto", display: "block" }} />
					</div>
					{item.description && (
						<figcaption style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>{item.description}</figcaption>
					)}
				</figure>
			);
		}
		return null;
	};

	const renderSection = (item, idx) => (
		<div key={idx} className="card" style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16 }}>
			<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>{item.subtitle}</h3>
			{item.type !== "video" && item.type !== "image" && (
				<p style={{ marginBottom: 12 }}>{item.description}</p>
			)}
			{item.type === "video" || item.type === "image" ? renderMedia(item) : (
				<div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
					<span style={{ opacity: 0.7 }}>📝</span>
					<span style={{ marginLeft: 8 }}>{item.content}</span>
				</div>
			)}
		</div>
	);

	return (
		<div style={{ padding: 24 }}>
			<div style={{ maxWidth: 1200, margin: "0 auto" }}>
				<nav style={{ fontSize: 12, color: "#E5E7EB", marginBottom: 12 }}>
					<Link to="/" className="white-text" style={{ opacity: 0.9 }}>Home</Link>
					<span style={{ margin: "0 8px" }}>/</span>
					<Link to="/news" className="white-text" style={{ opacity: 0.9 }}>News & Blogs</Link>
					<span style={{ margin: "0 8px" }}>/</span>
					<span className="white-text" style={{ opacity: 0.9 }}>{data.title}</span>
				</nav>

				<div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
					<article>
						<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 16 }}>
							<h1 style={{ fontFamily: "Poppins, sans-serif", marginTop: 0 }}>{data.title}</h1>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 13, color: "#6B7280", marginTop: 6 }}>
								<span>By {author}</span>
								<span>•</span>
								<time dateTime={data.publishedAt || new Date().toISOString()}>{publishedAt}</time>
							</div>

							<div style={{ marginTop: 16 }}>
								{renderMedia(firstItem)}
							</div>

							<div style={{ display: "flex", gap: 12, marginTop: 16 }}>
								<a className="btn btn-secondary" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer">Share on X</a>
								<a className="btn btn-secondary" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer">Share on Facebook</a>
							</div>
						</div>

						<div>
							{items.slice(1).map((it, idx) => renderSection(it, idx))}
							{items.length <= 1 && (
								<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 24 }}>
									<p>More details coming soon.</p>
								</div>
							)}
						</div>
					</article>

					<aside>
						<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
							<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>Related</h3>
							<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
								{items.map((it, i) => (
									<li key={i} style={{ marginBottom: 10 }}>
										<span style={{ fontSize: 13, color: "#374151" }}>{it.subtitle}</span>
									</li>
								))}
								{items.length === 0 && <li>No related items</li>}
							</ul>
						</div>

						<div className="card" style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
							<h3 style={{ fontFamily: "Poppins, sans-serif", marginBottom: 8 }}>Tags</h3>
							<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
								{(data.tags || []).map(tag => (
									<span key={tag} className="btn btn-text" style={{ border: "1px solid #E5E7EB", borderRadius: 999, padding: "6px 12px", color: "#374151" }}>{tag}</span>
								))}
							</div>
						</div>
					</aside>
				</div>

				<div style={{ marginTop: 24 }}>
					<Footer />
				</div>
			</div>
		</div>
	);
};

export default News; 