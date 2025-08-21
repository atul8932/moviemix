import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import "./styles.css";
import WhatsAppWidget from "./WhatsAppWidget";
import axios from "axios";
const PG_HOST = import.meta.env.DEV ? "" : "https://sandbox.cashfree.com";
import { load } from "@cashfreepayments/cashfree-js";

const CF_CLIENT_ID = import.meta.env.VITE_CASHFREE_CLIENT_ID || "YOUR_CLIENT_ID";
const CF_CLIENT_SECRET = import.meta.env.VITE_CASHFREE_CLIENT_SECRET || "YOUR_CLIENT_SECRET";

const Dashboard = () => {
  const [mobile, setMobile] = useState("");
  const [movie, setMovie] = useState("");
  const [language, setLanguage] = useState("english");
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenu, setActiveMenu] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const cashfreeRef = useRef(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paymentStatusInfo, setPaymentStatusInfo] = useState({ state: null, message: "" });

  // Auth guard and user state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser) {
        navigate("/");
      }
    });
    return () => unsub();
  }, [navigate]);

  // Initialize Cashfree SDK (sandbox)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cf = await load({ mode: "sandbox" });
        if (mounted) cashfreeRef.current = cf;
      } catch (e) {
        console.error("Cashfree init failed", e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch user's orders by email
  useEffect(() => {
    if (!user?.email) return;
    const q = query(collection(db, "movieRequests"), where("email", "==", user.email));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
    return () => unsubscribe();
  }, [user?.email]);

  // After returning from Cashfree, verify payment and create request
  useEffect(() => {
    const verifyAndCreate = async () => {
      try {
        const pendingStr = localStorage.getItem("cfPendingOrder");
        if (!pendingStr) return;
        const pending = JSON.parse(pendingStr);
        if (!pending?.orderId || !user?.email) return;

        let attempts = 0;
        const check = async () => {
          attempts += 1;
          try {
            const resp = await axios.get(`${PG_HOST}/pg/orders/${pending.orderId}` , {
              headers: {
                "Accept": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": CF_CLIENT_ID,
                "x-client-secret": CF_CLIENT_SECRET,
              },
            });
            const status = (resp?.data?.order_status || "").toUpperCase();
            if (status === "PAID") {
              await addDoc(collection(db, "movieRequests"), {
                mobile: pending.mobile,
                movieName: pending.movie,
                language: pending.language,
                email: user.email,
                createdAt: serverTimestamp(),
                status: "pending",
                paymentStatus: "success",
                downloadLink: "",
                cfOrderId: pending.orderId,
              });
              localStorage.removeItem("cfPendingOrder");
              setPaymentStatusInfo({ state: "paid", message: "Payment successful. Request created." });
              return;
            }
            if (status === "CANCELLED" || status === "EXPIRED" || status === "FAILED") {
              localStorage.removeItem("cfPendingOrder");
              setPaymentStatusInfo({ state: "failed", message: "Payment failed or expired. Please try again." });
              return;
            }
            setPaymentStatusInfo({ state: "pending", message: "Payment pending. We will keep checking..." });
            if (attempts < 6) {
              setTimeout(check, 5000);
            }
          } catch (e) {
            setPaymentStatusInfo({ state: "failed", message: "Could not verify payment. Please retry." });
          }
        };
        check();
      } catch (e) {
        console.error("Payment verification failed", e?.response?.data || e?.message);
      }
    };
    verifyAndCreate();
  }, [user?.email]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setPayError("");
    if (movie.trim() && mobile.trim() && user?.email) {
      try {
        setPaying(true);

        if (!cashfreeRef.current) {
          throw new Error("Payment SDK not ready. Please retry.");
        }

        const orderPayload = {
          order_amount: 5,
          order_currency: "INR",
          customer_details: {
            customer_id: user.uid || `cust_${Date.now()}`,
            customer_phone: mobile,
          },
          order_meta: {
           return_url: `${window.location.origin}/cf-return.html?order_id={order_id}`,
          },
        };

        const response = await axios.post(
          `${PG_HOST}/pg/orders`,
          orderPayload,
          {
            headers: {
              "Accept": "application/json",
              "x-api-version": "2023-08-01",
              "Content-Type": "application/json",
              "x-client-id": CF_CLIENT_ID,
              "x-client-secret": CF_CLIENT_SECRET,
            },
          }
        );

        const orderId = response?.data?.order_id;
        const paymentSessionId = response?.data?.payment_session_id || response?.data?.order_token;
        if (!paymentSessionId || !orderId) {
          throw new Error("Failed to get payment session.");
        }

        localStorage.setItem(
          "cfPendingOrder",
          JSON.stringify({ orderId, mobile, movie, language })
        );

        await cashfreeRef.current.checkout({
          paymentSessionId,
          redirectTarget: "_self",
        });
      } catch (err) {
        console.error("Error in request submit/payment", err?.response?.data || err?.message);
        setPayError(err?.response?.data?.message || err?.message || "Something went wrong");
      } finally {
        setPaying(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { text: "⏳ Waiting", class: "status-waiting" },
      completed: { text: "✅ Ready", class: "status-ready" },
      failed: { text: "❌ Failed", class: "status-failed" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-chip ${config.class}`}>{config.text}</span>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.movieName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const menuItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "request", label: "Request Movie", icon: "🎬" },
    { id: "orders", label: "My Orders", icon: "📋" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const dashboardUser = (user.email || "").slice(0, 5);
  const avatarLetter = (user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">MovieHub</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="user-menu">
            <div className="user-avatar">{avatarLetter}</div>
            <span className="user-name">{dashboardUser}</span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Quick Request Card */}
          <div className="request-card">
            <h2>Request a Movie</h2>
            <form onSubmit={handleRequestSubmit} className="request-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Mobile Number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Movie Name</label>
                  <input
                    type="text"
                    value={movie}
                    onChange={(e) => setMovie(e.target.value)}
                    placeholder="e.g., Inception, The Dark Knight"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} required>
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                  </select>
                </div>
              </div>
              {payError && <div className="error-message" style={{ marginBottom: 8 }}>{payError}</div>}
              {paymentStatusInfo?.message && (
                <div className="info-message" style={{ marginBottom: 8 }}>
                  {paymentStatusInfo.message}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={paying}>
                {paying ? "Processing..." : "Request Movie"}
              </button>
            </form>
          </div>

          {/* Recent Orders */}
          <div className="orders-section">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <div className="filters">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Waiting</option>
                  <option value="completed">Ready</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Movie Name 🎬</th>
                    <th>Mobile Model 📱</th>
                    <th>Status</th>
                    <th>Date Requested 📅</th>
                    <th>Download Link 🔗</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.movieName}</td>
                      <td>{order.mobile}</td>
                      <td>{getStatusChip(order.status)}</td>
                      <td>
                        {order.createdAt?.toDate().toLocaleDateString() || "—"}
                      </td>
                      <td>
                        {order.downloadLink ? (
                          <a 
                            href={order.downloadLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="download-link"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="no-link">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="empty-state">
                  <p>No orders found. Start by requesting a movie!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating WhatsApp Widget */}
      <WhatsAppWidget />
    </div>
  );
};

export default Dashboard; 