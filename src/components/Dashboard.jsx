import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import "./styles.css";
import WhatsAppWidget from "./WhatsAppWidget";
// import { load } from "@cashfreepayments/cashfree-js"; // Removed to avoid SDK issues
import { load } from "@cashfreepayments/cashfree-js";

const CF_CLIENT_ID = import.meta.env.VITE_CASHFREE_CLIENT_ID || "";
const CF_CLIENT_SECRET = import.meta.env.VITE_CASHFREE_CLIENT_SECRET || "";
const APP_BASE_URL = window.location.origin;
const PG_BASE = import.meta.env.DEV ? "/pg" : "https://sandbox.cashfree.com/pg";


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
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paymentStatusInfo, setPaymentStatusInfo] = useState({ state: null, message: "" });
  const cashfreeRef = useRef(null);


  // Auth guard and user state
  useEffect(() => {
    console.log('=== AUTH USE EFFECT TRIGGERED ===');
    console.log('Current user:', user);
    console.log('Loading state:', loading);
    
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      console.log('=== AUTH STATE CHANGED ===');
      console.log('New user:', currentUser);
      console.log('User email:', currentUser?.email);
      
      setUser(currentUser);
      setLoading(false);
      
      if (!currentUser) {
        console.log('No user, navigating to home');
        navigate("/");
      } else {
        console.log('User authenticated, staying on dashboard');
      }
    });
    return () => unsub();
  }, [navigate]);


  // Initialize Cashfree SDK (sandbox)
  useEffect(() => {
    console.log('=== CASHFREE SDK USE EFFECT TRIGGERED ===');
    console.log('Component mounted, starting SDK initialization...');
    
    let mounted = true;
    (async () => {
      try {
        console.log('=== INITIALIZING CASHFREE SDK ===');
        console.log('Loading Cashfree SDK in sandbox mode...');
        console.log('SDK load function:', typeof load);
        
        const cf = await load({ mode: "sandbox" });
        console.log('Cashfree SDK loaded successfully:', !!cf);
        console.log('SDK object:', cf);
        
        if (mounted) {
          cashfreeRef.current = cf;
          console.log('Cashfree SDK reference set in ref');
          console.log('Ref current value:', cashfreeRef.current);
        } else {
          console.log('Component unmounted, not setting SDK ref');
        }
      } catch (e) {
        console.error("Cashfree init failed", e);
        console.error("Error details:", e.message);
        console.error("Error stack:", e.stack);
      }
    })();
    
    return () => { 
      console.log('=== CASHFREE SDK USE EFFECT CLEANUP ===');
      mounted = false; 
    };
  }, []);


  // Fetch user's orders by email
  useEffect(() => {
    console.log('=== ORDERS USE EFFECT TRIGGERED ===');
    console.log('User email:', user?.email);
    console.log('User object:', user);
    
    if (!user?.email) {
      console.log('No user email, skipping orders fetch');
      return;
    }
    
    console.log('Setting up Firestore listener for email:', user.email);
    const q = query(collection(db, "movieRequests"), where("email", "==", user.email));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('=== FIRESTORE ORDERS UPDATE ===');
      console.log('Query snapshot size:', querySnapshot.size);
      console.log('Query snapshot empty:', querySnapshot.empty);
      
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Processed orders data:', ordersData);
      
      setOrders(ordersData);
    }, (error) => {
      console.error('Firestore orders listener error:', error);
    });
    
    return () => {
      console.log('=== ORDERS USE EFFECT CLEANUP ===');
      console.log('Unsubscribing from Firestore listener');
      unsubscribe();
    };
  }, [user?.email]);

  // After returning from Cashfree, verify payment status
  useEffect(() => {
    console.log('=== PAYMENT VERIFICATION USE EFFECT TRIGGERED ===');
    console.log('User email:', user?.email);
    console.log('User authenticated:', !!user);
    
    const verifyAndCreateRequest = async () => {
      try {
        console.log('=== CHECKING LOCAL STORAGE ===');
        const pendingStr = localStorage.getItem("cfPendingOrder");
        console.log('Pending order from localStorage:', pendingStr);
        
        if (!pendingStr || !user?.email) {
          console.log('No pending order or user email, skipping verification');
          return;
        }
        
        const pending = JSON.parse(pendingStr);
        console.log('Parsed pending order:', pending);
        
        if (!pending?.orderId) {
          console.log('No order ID in pending order, skipping verification');
          return;
        }

        console.log('=== STARTING PAYMENT VERIFICATION ===');
        console.log('Pending order details:', pending);
        console.log('User email:', user.email);
        
        // Call the API function with the same pattern as handleRequestSubmit
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: pending.orderId,
            userEmail: user.email,
            orderDetails: pending
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Payment verification result:', result);
        
        // Handle the API response based on status
        if (result.success && result.status === "PAID") {
          console.log('=== PAYMENT VERIFIED - CREATING MOVIE REQUEST ===');
          
          // Create movie request in Firestore
          try {
            const movieRequest = {
              mobile: pending.mobile,
              movieName: pending.movie,
              language: pending.language,
              email: user.email,
              createdAt: serverTimestamp(),
              status: "pending",
              paymentStatus: "success",
              downloadLink: "",
              cfOrderId: pending.orderId,
              paymentMethod: result.data?.payment_method || ""
            };
            
            console.log('Movie request data:', movieRequest);
            
            const docRef = await addDoc(collection(db, "movieRequests"), movieRequest);
            console.log('Movie request created successfully:', docRef.id);
            
            localStorage.removeItem("cfPendingOrder");
            setPaymentStatusInfo({ 
              state: "success", 
              message: "Payment verified! Movie request created." 
            });
            
          } catch (firestoreError) {
            console.error('=== FIRESTORE ERROR ===');
            console.error('Error creating movie request:', firestoreError);
            setPaymentStatusInfo({ 
              state: "error", 
              message: "Payment verified but failed to create movie request. Please contact support." 
            });
          }
          
        } else if (result.status === "FAILED") {
          console.log('=== PAYMENT FAILED ===');
          localStorage.removeItem("cfPendingOrder");
          setPaymentStatusInfo({ 
            state: "error", 
            message: "Payment failed. Please try again." 
          });
          
        } else if (result.status === "PENDING") {
          console.log('=== PAYMENT PENDING ===');
          setPaymentStatusInfo({ 
            state: "pending", 
            message: `Payment still pending... (Attempt ${result.attempts}/${result.maxAttempts})` 
          });
          
          // Frontend will handle retries by calling this function again
          if (result.attempts < result.maxAttempts) {
            setTimeout(() => verifyAndCreateRequest(), 5000);
          }
          
        } else {
          console.log('=== UNKNOWN PAYMENT STATUS ===');
          setPaymentStatusInfo({ 
            state: "error", 
            message: result.message || "Payment verification failed. Please contact support." 
          });
        }
      } catch (e) {
        console.error("Payment verification failed", e?.message);
      }
    };
    
    verifyAndCreateRequest();
  }, [user?.email]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !movie || paying) return;
    
    setPaying(true);
    setPayError("");
    
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderAmount: 6, // Fixed amount for testing
          customerPhone: mobile,
          customerEmail: user?.email || `customer_${Date.now()}@example.com`,
          returnUrl: `${APP_BASE_URL}/#/dashboard`
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Payment creation failed: ${errorData}`);

      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Payment creation failed');
      }

      const { order_id, payment_session_id } = data;
      
      if (!order_id || !payment_session_id) {
        throw new Error('Invalid payment response from server');
      }

      // Store pending order details
      localStorage.setItem("cfPendingOrder", JSON.stringify({ 
        orderId: order_id, 
        mobile, 
        movie, 
        language 
      }));

      // Launch Cashfree checkout
      console.log('=== LAUNCHING CASHFREE CHECKOUT ===');
      console.log('Payment Session ID:', payment_session_id);
      console.log('Payment Link:', data.payment_link);
      console.log('Cashfree SDK Ready:', !!cashfreeRef.current);
      
      // Try direct redirect first (more reliable)
      if (data.payment_link) {
        console.log('Using direct payment link redirect');
        window.open(data.payment_link, '_self');
        return;
      }
      
      // Fallback to SDK checkout
      if (!cashfreeRef.current) {
        throw new Error("Payment SDK not ready and no payment link available");
      }
      
      console.log('Falling back to SDK checkout...');
      try {
        await cashfreeRef.current.checkout({
          paymentSessionId: payment_session_id,
          redirectTarget: "_self",
        });
        console.log('SDK checkout launched successfully');
      } catch (checkoutError) {
        console.error('SDK checkout also failed:', checkoutError);
        throw new Error('Both checkout methods failed');
      }

    } catch (err) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Error type:", err.constructor.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      console.error("Full error object:", err);
      setPayError(err.message || "Something went wrong");
    } finally {
      setPaying(false);
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
              <button type="submit" className="btn btn-primary">
                Request Movie
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