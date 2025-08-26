import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import "./styles.css";
import googleIcon from "../assets/google-icon.svg";
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
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        if (authForm.name) {
          await updateProfile(cred.user, { displayName: authForm.name });
        }
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
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
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
        });
      }
    } catch (err) {
      console.error(err);
      setError("Google sign-in failed. Please try again.");
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

  const handleTabChange = (tab) => {
    setAuthTab(tab);
    setError("");
    setAuthForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">MovieHub</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-text" 
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
            </div>

            {error && <div className="error-message">{error}</div>}

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

            <div className="divider">OR</div>

            <button className="btn btn-google" onClick={handleGoogleSignIn} disabled={loading}>
              <img src= {googleIcon} alt="Google" className="google-icon" />
              Sign In with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
