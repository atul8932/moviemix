import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [linkInput, setLinkInput] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Real-time updates
  useEffect(() => {
    const q = query(collection(db, "movieRequests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateRequest = async (id, link) => {
    if (!link) {
      alert("Please provide a download link.");
      return;
    }
    await updateDoc(doc(db, "movieRequests", id), {
      status: "completed",
      downloadLink: link,
    });
    setLinkInput((prev) => ({ ...prev, [id]: "" }));
    alert("Request updated successfully!");
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "badge badge-yellow",
      completed: "badge badge-green",
      failed: "badge badge-red",
    };
    return <span className={map[status] || map.pending}>{status}</span>;
  };

  const getPaymentBadge = (paymentStatus) => {
    const map = {
      success: "badge badge-green",
      pending: "badge badge-yellow",
      failed: "badge badge-red",
    };
    return (
      <span className={map[paymentStatus] || "badge badge-gray"}>
        {paymentStatus || "—"}
      </span>
    );
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.mobile?.includes(search) ||
      req.movieName?.toLowerCase().includes(search.toLowerCase()) ||
      req.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || req.status === filter || req.paymentStatus === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🎬 Admin Panel</h1>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by mobile, movie, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="success">Payment Success</option>
            <option value="pendingPayment">Payment Pending</option>
          </select>
        </div>
      </header>

      {loading ? (
        <p className="loading">Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="empty">No requests found.</p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mobile</th>
                <th>Email</th>
                <th>Movie</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Download Link</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.mobile || "—"}</td>
                  <td>{req.email || "—"}</td>
                  <td>{req.movieName || "—"}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>{getPaymentBadge(req.paymentStatus)}</td>
                  <td>
                    {req.downloadLink ? (
                      <a className="link-button2" href={req.downloadLink} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{req.createdAt?.toDate().toLocaleString() || "—"}</td>
                  <td>
                    {req.status === "pending" ? (
                      <div className="action-group">
                        <input
                          type="text"
                          placeholder="Paste link"
                          value={linkInput[req.id] || ""}
                          onChange={(e) =>
                            setLinkInput({ ...linkInput, [req.id]: e.target.value })
                          }
                        />
                        <button
                          className="btn-complete"
                          onClick={() => updateRequest(req.id, linkInput[req.id])}
                        >
                          Complete
                        </button>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
