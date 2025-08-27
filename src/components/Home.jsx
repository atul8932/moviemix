import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import "./styles.css";
// Google icon inlined in JSX; no import needed

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
    });
    return () => unsub();
  }, [navigate]);

  const handleGetStarted = () => setShowAuthModal(true);

  const handleInputChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (authTab === "signup") {
        // Create account
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        // Update profile with display name
        if (authForm.name) {
          await updateProfile(cred.user, { displayName: authForm.name });
        }
        // Create user doc if not exists
        const userRef = doc(db, "users", cred.user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: cred.user.uid,
            name: authForm.name || "",
            email: authForm.email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            role: "user",
            status: "active"
          });
        }
      } else {
        // Login
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      // Redirect will happen via onAuthStateChanged
    } catch (err) {
      setError(mapAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Create user document in Firestore if it doesn't exist
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: "user",
          status: "active",
          photoURL: user.photoURL || "",
          provider: "google"
        });
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(mapGoogleAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const mapAuthError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email already in use.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const mapGoogleAuthError = (code) => {
    switch (code) {
      case "auth/popup-closed-by-user":
        return "Sign-in was cancelled. Please try again.";
      case "auth/popup-blocked":
        return "Pop-up was blocked by your browser. Please allow pop-ups and try again.";
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled. Please try again.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address but different sign-in credentials.";
      case "auth/operation-not-allowed":
        return "Google sign-in is not enabled. Please contact support.";
      case "auth/user-disabled":
        return "This account has been disabled.";
      case "auth/invalid-credential":
        return "Invalid credentials. Please try again.";
      default:
        return "Google sign-in failed. Please try again.";
    }
  };

  // Forgot Password Form Component
  const ForgotPasswordForm = () => {
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
    
    const handleResetSubmit = async (e) => {
      e.preventDefault();
      setResetLoading(true);
      setResetError("");
      setResetSuccess("");
      
      try {
        await sendPasswordResetEmail(auth, resetEmail);
        setResetSuccess("Password reset email sent! Check your inbox.");
        setResetEmail("");
      } catch (err) {
        setResetError(mapAuthError(err?.code));
      } finally {
        setResetLoading(false);
      }
    };
    
    return (
      <form onSubmit={handleResetSubmit} className="auth-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        {resetError && <div className="error-message">{resetError}</div>}
        {resetSuccess && <div className="success-message">{resetSuccess}</div>}
        
        <button type="submit" className="btn btn-primary btn-full" disabled={resetLoading}>
          {resetLoading ? <span className="loading-spinner-small"></span> : "Send Reset Email"}
        </button>
        
        <button 
          type="button" 
          className="btn btn-secondary btn-full"
          onClick={() => setAuthTab("login")}
        >
          Back to Login
        </button>
      </form>
    );
  };

  const handleTabChange = (tab) => {
    setAuthTab(tab);
    setError("");
    setSuccess("");
    setAuthForm({ name: "", email: "", password: "" });
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(mapAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieHub</span>
        </div>
        <nav className="header-links" style={{ display: "flex", gap: 16 }}>
          <Link className="btn btn-text white-text" to="/bollywood" >Bollywood</Link>
          <Link className="btn btn-text white-text" to="/hollywood">Hollywood</Link>
          <Link className="btn btn-text white-text" to="/ott">OTT Originals</Link>
        </nav>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => { setAuthTab("login"); setShowAuthModal(true); }}
          >
            Login
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => { setAuthTab("signup"); setShowAuthModal(true); }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Download Your Movies, Anytime, Anywhere</h1>
          <p className="hero-subtitle">Request movies optimized for your device. Get them in minutes.</p>
          <div className="offer-card">
            <span className="offer-badge">🔥 Limited-time Offer</span>
            <h3 className="offer-title">Download Movies for Just ₹5 – Say Goodbye to Expensive OTT Subscriptions!</h3>
            <div className="offer-divider"></div>
            <p className="offer-text">
              Tired of juggling multiple OTT platforms and paying high monthly fees? Discover a smarter way to watch your favorite movies by downloading them for just ₹5! Enjoy blockbuster entertainment on your own terms without burning a hole in your pocket. This affordable solution could change how you consume content—no more subscriptions, no more limits. Just pay per movie and watch anytime, anywhere.
            </p>
          </div>

          <div className="offer-row">
            <div className="offer-mini-card">
              <h4 className="offer-mini-title">Pay-Per-Movie Convenience</h4>
              <p className="offer-mini-text">No long-term commitments. Pay only for what you watch and enjoy it offline anytime.</p>
            </div>
            <div className="offer-mini-card">
              <h4 className="offer-mini-title">Optimized for Your Device</h4>
              <p className="offer-mini-text">We tailor downloads for better quality and smaller file size across phones and tablets.</p>
            </div>
          </div>
          <button className="btn btn-primary btn-large" onClick={handleGetStarted}>Get Started</button>
        </div>
        <div className="hero-background">
          <div className="movie-collage"></div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Welcome to MovieHub</h2>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authTab === "login" ? "active" : ""}`}
                onClick={() => handleTabChange("login")}
              >Login</button>
              <button 
                className={`auth-tab ${authTab === "signup" ? "active" : ""}`}
                onClick={() => handleTabChange("signup")}
              >Sign Up</button>
              <button 
                className={`auth-tab ${authTab === "forgot-password" ? "active" : ""}`}
                onClick={() => handleTabChange("forgot-password")}
              >Reset Password</button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {authTab === "forgot-password" ? (
              <ForgotPasswordForm />
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-form">
              {authTab === "signup" && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>

              {authTab === "login" && (
                <div className="form-footer">
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="loading-spinner-small"></span> : (authTab === "login" ? "Login" : "Sign Up")}
              </button>
            </form>
            )}

            {/* Add divider and Google sign-in button */}
            {authTab !== "forgot-password" && (
              <>
                <div className="divider">OR</div>

                <button 
                  className="btn btn-google" 
                  onClick={handleGoogleSignIn} 
                  disabled={loading}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="google-icon" aria-hidden="true">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                  Sign In with Google
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
