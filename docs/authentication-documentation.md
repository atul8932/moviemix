# Authentication System Documentation

## Overview
This document provides comprehensive documentation for the authentication system in MovieHub, covering both Firebase email/password authentication and Google OAuth integration.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Firebase Configuration](#firebase-configuration)
3. [Authentication Methods](#authentication-methods)
4. [Implementation Details](#implementation-details)
5. [User Data Management](#user-data-management)
6. [Security Features](#security-features)
7. [Error Handling](#error-handling)
8. [Testing Guide](#testing-guide)
9. [Deployment Considerations](#deployment-considerations)
10. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Components Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION ARCHITECTURE               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (React)                    Backend (Firebase)    │
│  ┌─────────────────┐                ┌─────────────────┐    │
│  │   Home.jsx      │                │   Firebase      │    │
│  │   - Auth Modal  │◄──────────────►│   Auth          │    │
│  │   - Forms       │                │   - Email/Pass  │    │
│  │   - Google Btn  │                │   - Google OAuth│    │
│  └─────────────────┘                └─────────────────┘    │
│           │                                    │            │
│           ▼                                    ▼            │
│  ┌─────────────────┐                ┌─────────────────┐    │
│  │   Dashboard.jsx │                │   Firestore     │    │
│  │   - Protected   │◄──────────────►│   - User Docs   │    │
│  │   - User Data   │                │   - User State  │    │
│  └─────────────────┘                └─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow
1. **User Entry**: User visits home page
2. **Authentication Trigger**: User clicks login/signup or Google button
3. **Firebase Authentication**: Firebase handles the authentication process
4. **User Data Storage**: User document created/updated in Firestore
5. **State Management**: Authentication state updated in React app
6. **Navigation**: User redirected to dashboard

---

## Firebase Configuration

### Project Setup
```javascript
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCdxM1pJV8oAEcpp3stf1lU-i3cc1aVgZQ",
  authDomain: "moviemix-e1c54.firebaseapp.com",
  projectId: "moviemix-e1c54",
  storageBucket: "moviemix-e1c54.firebasestorage.app",
  messagingSenderId: "332490065737",
  appId: "1:332490065737:web:03f6eff180357e5d15fc98",
  measurementId: "G-FTHTD2939Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configure persistent session
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Ignore persistence errors; default persistence will apply
});
```

### Firebase Console Configuration

#### 1. Enable Authentication Methods
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Email/Password provider
3. Enable Google provider
4. Configure OAuth consent screen for Google

#### 2. Authorized Domains
Add your domains to authorized domains:
- `localhost` (for development)
- `your-production-domain.com` (for production)

#### 3. Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Movie requests - users can create their own requests
    match /movieRequests/{requestId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Authentication Methods

### 1. Email/Password Authentication

#### Implementation
```javascript
// src/components/Home.jsx
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";

const handleAuthSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  
  try {
    if (authTab === "signup") {
      // Create new account
      const cred = await createUserWithEmailAndPassword(
        auth, 
        authForm.email, 
        authForm.password
      );
      
      // Update profile with display name
      if (authForm.name) {
        await updateProfile(cred.user, { 
          displayName: authForm.name 
        });
      }
      
      // Create user document in Firestore
      await createUserDocument(cred.user, authForm.name);
      
    } else {
      // Sign in existing user
      await signInWithEmailAndPassword(
        auth, 
        authForm.email, 
        authForm.password
      );
    }
  } catch (err) {
    setError(mapAuthError(err?.code));
  } finally {
    setLoading(false);
  }
};
```

#### Form Validation
```javascript
const validateForm = () => {
  const errors = [];
  
  if (!authForm.email) {
    errors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(authForm.email)) {
    errors.push("Email is invalid");
  }
  
  if (!authForm.password) {
    errors.push("Password is required");
  } else if (authForm.password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  
  if (authTab === "signup" && !authForm.name) {
    errors.push("Name is required");
  }
  
  return errors;
};

#### Forgot Password Implementation
```javascript
import { sendPasswordResetEmail } from "firebase/auth";

const handleForgotPassword = async (email) => {
  setLoading(true);
  setError("");
  setSuccessMessage("");
  
  try {
    await sendPasswordResetEmail(auth, email);
    setSuccessMessage("Password reset email sent! Check your inbox.");
  } catch (err) {
    setError(mapAuthError(err?.code));
  } finally {
    setLoading(false);
  }
};

// Forgot Password Form Component
const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (err) {
      setError(mapAuthError(err?.code));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
        {loading ? <span className="loading-spinner-small"></span> : "Send Reset Email"}
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
```
```

### 2. Google OAuth Authentication

#### Implementation
```javascript
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const handleGoogleSignIn = async () => {
  setLoading(true);
  setError("");
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create user document if it doesn't exist
    await createUserDocument(user, user.displayName);
    
  } catch (err) {
    console.error("Google sign-in error:", err);
    setError(mapGoogleAuthError(err?.code));
  } finally {
    setLoading(false);
  }
};
```

#### Google Provider Configuration
```javascript
const provider = new GoogleAuthProvider();

// Optional: Add custom parameters
provider.addScope('email');
provider.addScope('profile');

// Optional: Set custom parameters
provider.setCustomParameters({
  prompt: 'select_account'
});
```

---

## Implementation Details

### Authentication State Management
```javascript
// src/components/Home.jsx
import { onAuthStateChanged } from "firebase/auth";

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      navigate("/dashboard");
    } else {
      // User is signed out
      // Stay on home page
    }
  });
  
  return () => unsub(); // Cleanup subscription
}, [navigate]);
```

### User Document Creation
```javascript
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

const createUserDocument = async (user, displayName = "") => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: displayName || user.displayName || "",
      email: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: "user",
      status: "active",
      photoURL: user.photoURL || "",
      provider: user.providerData[0]?.providerId || "email"
    });
  }
};
```

### Auth Modal with Forgot Password
```javascript
// Complete Auth Modal Implementation
const AuthModal = () => {
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTabChange = (tab) => {
    setAuthTab(tab);
    setError("");
    setSuccess("");
    setAuthForm({ name: "", email: "", password: "" });
  };

  return (
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

        {authTab === "login" && (
          <form onSubmit={handleAuthSubmit} className="auth-form">
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

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="loading-spinner-small"></span> : "Login"}
            </button>
          </form>
        )}

        {authTab === "signup" && (
          <form onSubmit={handleAuthSubmit} className="auth-form">
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

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="loading-spinner-small"></span> : "Sign Up"}
            </button>
          </form>
        )}

        {authTab === "forgot-password" && (
          <ForgotPasswordForm />
        )}

        {/* Google Sign-in Button */}
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
  );
};
```

### Protected Routes
```javascript
// src/App.jsx
import { useAuthState } from 'react-firebase-hooks/auth';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Usage in routes
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

---

## User Data Management

### User Document Structure
```javascript
{
  uid: "user_unique_id",
  name: "User Display Name",
  email: "user@example.com",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  role: "user", // "user" | "admin"
  status: "active", // "active" | "inactive" | "suspended"
  photoURL: "https://...", // Google profile picture
  provider: "google" | "email", // Authentication provider
  preferences: {
    language: "en",
    notifications: true
  },
  metadata: {
    lastLogin: Timestamp,
    loginCount: 0
  }
}
```

### User Data Operations
```javascript
// Get user data
const getUserData = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};

// Update user data
const updateUserData = async (uid, updates) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Delete user account
const deleteUserAccount = async (user) => {
  // Delete user document
  const userRef = doc(db, "users", user.uid);
  await deleteDoc(userRef);
  
  // Delete Firebase auth account
  await deleteUser(user);
};
```

---

## Security Features

### 1. Authentication Security
- **HTTPS Required**: All authentication requests require HTTPS in production
- **Domain Verification**: Only authorized domains can use authentication
- **Rate Limiting**: Firebase automatically limits authentication attempts
- **Session Management**: Persistent sessions with automatic token refresh

### 2. Data Security
- **Firestore Security Rules**: Restrict access to user's own data
- **Input Validation**: Client and server-side validation
- **Error Handling**: No sensitive information exposed in error messages
- **Secure Storage**: User data stored securely in Firestore

### 3. Google OAuth Security
- **OAuth Consent Screen**: Configured in Google Cloud Console
- **Scopes**: Minimal required scopes (email, profile)
- **State Verification**: Firebase handles OAuth state verification
- **Token Validation**: Automatic token validation and refresh

### 4. Password Reset Configuration

#### Firebase Console Setup
1. **Enable Email Templates**: Go to Firebase Console → Authentication → Templates
2. **Customize Reset Email**: 
   - Subject line: "Reset your MovieHub password"
   - Action URL: Your app's password reset page
   - Email content: Professional reset instructions
3. **Configure Action URL**: Set to your app's domain for password reset

#### Password Reset Flow
```javascript
// Complete Password Reset Flow
const PasswordResetFlow = () => {
  // 1. User requests password reset
  const requestReset = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };
  
  // 2. User clicks link in email (handled by Firebase)
  // 3. User lands on reset page with actionCode
  const handlePasswordReset = async (actionCode, newPassword) => {
    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      // Password successfully reset
    } catch (error) {
      // Handle reset errors
    }
  };
};
```

#### Security Considerations
- **Rate Limiting**: Firebase automatically limits reset attempts
- **Token Expiry**: Reset links expire after 1 hour
- **One-time Use**: Reset links can only be used once
- **Email Verification**: Only works for verified email addresses

### 5. Best Practices
```javascript
// Secure error handling
const mapAuthError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email already in use.";
    case "auth/invalid-email":
      return "Invalid email address.";
    // ... other cases
    default:
      return "Something went wrong. Please try again.";
  }
};

// Input sanitization
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

// Secure logout
const handleLogout = async () => {
  try {
    await signOut(auth);
    // Clear any local state
    localStorage.clear();
    // Redirect to home
    navigate('/');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

## Error Handling

### Email/Password Errors
```javascript
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
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/too-many-requests":
      return "Too many password reset attempts. Try again later.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    default:
      return "Something went wrong. Please try again.";
  }
};
```

### Google OAuth Errors
```javascript
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
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    default:
      return "Google sign-in failed. Please try again.";
  }
};
```

### Error Display
```javascript
// Error message component
const ErrorMessage = ({ error, onRetry }) => {
  if (!error) return null;
  
  return (
    <div className="error-message">
      <p>{error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary">
          Try Again
        </button>
      )}
    </div>
  );
};
```

---

## Testing Guide

### Manual Testing Checklist

#### Email/Password Authentication
- [ ] **Valid Sign Up**: New user registration with valid data
- [ ] **Valid Login**: Existing user login with correct credentials
- [ ] **Invalid Email**: Sign up/login with invalid email format
- [ ] **Weak Password**: Sign up with password less than 6 characters
- [ ] **Existing Email**: Sign up with already registered email
- [ ] **Wrong Password**: Login with incorrect password
- [ ] **Non-existent User**: Login with unregistered email
- [ ] **Empty Fields**: Submit form with empty required fields

#### Forgot Password Functionality
- [ ] **Valid Email**: Password reset email sent to registered email
- [ ] **Invalid Email**: Error message for non-existent email
- [ ] **Empty Email**: Validation error for empty email field
- [ ] **Malformed Email**: Error for invalid email format
- [ ] **Rate Limiting**: Too many reset attempts handled
- [ ] **Email Delivery**: Reset email received in inbox
- [ ] **Reset Link**: Link in email works correctly
- [ ] **Password Update**: New password can be set via reset link

#### Google OAuth Authentication
- [ ] **Successful Login**: Valid Google account authentication
- [ ] **Popup Blocked**: Browser blocks Google popup
- [ ] **User Cancels**: User closes Google popup
- [ ] **Account Disabled**: Google account disabled
- [ ] **Different Credentials**: Account exists with different method
- [ ] **Network Error**: Poor internet connection during auth
- [ ] **Multiple Accounts**: User has multiple Google accounts

#### General Scenarios
- [ ] **Already Logged In**: User visits home page while authenticated
- [ ] **Session Expiry**: User session expires
- [ ] **Multiple Tabs**: User opens multiple tabs
- [ ] **Browser Refresh**: Page refresh during authentication
- [ ] **Logout**: User logs out successfully
- [ ] **Account Deletion**: User deletes their account

### Automated Testing
```javascript
// Example test with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth');

test('user can sign in with email and password', async () => {
  signInWithEmailAndPassword.mockResolvedValueOnce({
    user: { uid: 'test-uid', email: 'test@example.com' }
  });
  
  render(<Home />);
  
  fireEvent.click(screen.getByText('Login'));
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' }
  });
  fireEvent.click(screen.getByText('Login'));
  
  await waitFor(() => {
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password123'
    );
  });
});
```

---

## Deployment Considerations

### Environment Variables
```bash
# .env.local (development)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Production environment variables (Vercel/Netlify)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Production Checklist
- [ ] **HTTPS Enabled**: All production traffic uses HTTPS
- [ ] **Domain Authorization**: Production domain added to Firebase
- [ ] **Google OAuth**: OAuth consent screen configured for production
- [ ] **Security Rules**: Firestore security rules deployed
- [ ] **Error Monitoring**: Error tracking configured
- [ ] **Analytics**: Firebase Analytics enabled
- [ ] **Performance**: App performance optimized

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
});
```

---

## Troubleshooting

### Common Issues

#### 1. Google Sign-in Not Working
**Problem**: Google authentication fails or popup doesn't open
**Solutions**:
- Check if Google provider is enabled in Firebase console
- Verify domain is authorized in Firebase console
- Ensure HTTPS is used in production
- Check browser popup blocker settings

#### 2. Email/Password Authentication Fails
**Problem**: Users can't sign up or log in
**Solutions**:
- Verify Email/Password provider is enabled
- Check Firebase project configuration
- Ensure proper error handling
- Verify form validation

#### 3. User Data Not Saving
**Problem**: User document not created in Firestore
**Solutions**:
- Check Firestore security rules
- Verify Firestore is enabled
- Check network connectivity
- Review error logs

#### 4. Authentication State Issues
**Problem**: User state not persisting or updating
**Solutions**:
- Check `onAuthStateChanged` implementation
- Verify persistence configuration
- Clear browser cache and cookies
- Check for multiple Firebase instances

#### 5. Password Reset Issues
**Problem**: Password reset emails not being sent or received
**Solutions**:
- Verify Email/Password provider is enabled in Firebase console
- Check if email templates are configured properly
- Ensure email address exists in Firebase auth
- Check spam/junk folders for reset emails
- Verify action URL is configured correctly
- Check rate limiting - wait before requesting another reset

### Debug Tools
```javascript
// Enable Firebase debug mode
localStorage.setItem('firebase:debug', '*');

// Log authentication state changes
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? user.uid : 'No user');
});

// Log Firestore operations
const userRef = doc(db, "users", "test");
getDoc(userRef).then((doc) => {
  console.log('Firestore document:', doc.data());
}).catch((error) => {
  console.error('Firestore error:', error);
});
```

### Performance Optimization
```javascript
// Lazy load Firebase modules
const loadFirebase = async () => {
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  
  return { initializeApp, getAuth, getFirestore };
};

// Optimize Firestore queries
const getUserData = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};
```

---

## API Reference

### Firebase Auth Methods
```javascript
// Authentication
signInWithEmailAndPassword(auth, email, password)
createUserWithEmailAndPassword(auth, email, password)
signInWithPopup(auth, provider)
signOut(auth)

// Password Reset
sendPasswordResetEmail(auth, email)

// User Management
updateProfile(user, { displayName, photoURL })
deleteUser(user)
sendPasswordResetEmail(auth, email)

// State Management
onAuthStateChanged(auth, callback)
onIdTokenChanged(auth, callback)
```

### Firestore Methods
```javascript
// Document Operations
setDoc(docRef, data)
updateDoc(docRef, data)
getDoc(docRef)
deleteDoc(docRef)

// Collection Operations
addDoc(collectionRef, data)
getDocs(collectionRef)
query(collectionRef, ...queryConstraints)
```

### React Hooks
```javascript
// Custom authentication hook
const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut: () => signOut(auth)
  };
};
```

---

This comprehensive documentation provides everything needed to understand, implement, test, and maintain the authentication system in MovieHub. 