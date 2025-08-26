# Login Flow Diagram Documentation

## Overview
This document provides detailed flow diagrams for the authentication system in MovieHub, covering both email/password and Google authentication methods.

## Authentication Methods

### 1. Email/Password Authentication
### 2. Google OAuth Authentication

---

## 1. Email/Password Login Flow

```mermaid
flowchart TD
    A[User visits Home page] --> B{User already logged in?}
    B -->|Yes| C[Redirect to Dashboard]
    B -->|No| D[Show Home page with Login/Sign Up buttons]
    
    D --> E[User clicks Login/Sign Up button]
    E --> F[Open Auth Modal]
    
    F --> G{Selected Tab?}
    G -->|Login| H[Show Login Form]
    G -->|Sign Up| I[Show Sign Up Form with Name field]
    
    H --> J[User enters Email & Password]
    I --> K[User enters Name, Email & Password]
    
    J --> L[Click Login button]
    K --> M[Click Sign Up button]
    
    L --> N[Validate form data]
    M --> N
    
    N --> O{Form valid?}
    O -->|No| P[Show validation errors]
    O -->|Yes| Q[Set loading state]
    
    P --> J
    Q --> R{Action type?}
    
    R -->|Login| S[Call signInWithEmailAndPassword]
    R -->|Sign Up| T[Call createUserWithEmailAndPassword]
    
    S --> U{Login successful?}
    T --> V{Sign Up successful?}
    
    U -->|No| W[Show error message]
    V -->|No| W
    
    U -->|Yes| X[onAuthStateChanged triggers]
    V -->|Yes| Y[Update user profile with display name]
    
    Y --> Z[Create user document in Firestore]
    Z --> X
    
    X --> AA[Redirect to Dashboard]
    W --> J
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style AA fill:#c8e6c9
    style W fill:#ffcdd2
```

---

## 2. Google OAuth Login Flow

```mermaid
flowchart TD
    A[User visits Home page] --> B{User already logged in?}
    B -->|Yes| C[Redirect to Dashboard]
    B -->|No| D[Show Home page with Login/Sign Up buttons]
    
    D --> E[User clicks Login/Sign Up button]
    E --> F[Open Auth Modal]
    
    F --> G[User clicks 'Sign In with Google' button]
    G --> H[Set loading state]
    H --> I[Create GoogleAuthProvider instance]
    
    I --> J[Call signInWithPopup with provider]
    J --> K{Popup opens successfully?}
    
    K -->|No| L[Handle popup blocked/closed error]
    K -->|Yes| M[Google OAuth popup appears]
    
    M --> N[User selects Google account]
    N --> O[User grants permissions]
    O --> P{Authentication successful?}
    
    P -->|No| Q[Show Google-specific error message]
    P -->|Yes| R[Get user data from Google]
    
    R --> S[Check if user document exists in Firestore]
    S --> T{User exists?}
    
    T -->|No| U[Create new user document]
    T -->|Yes| V[Skip document creation]
    
    U --> W[Store user data in Firestore]
    V --> X[onAuthStateChanged triggers]
    W --> X
    
    X --> Y[Redirect to Dashboard]
    L --> Z[Show error message]
    Q --> Z
    Z --> G
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style Y fill:#c8e6c9
    style Z fill:#ffcdd2
```

---

## 3. Complete Authentication State Management Flow

```mermaid
flowchart TD
    A[App Initialization] --> B[Initialize Firebase Auth]
    B --> C[Set up onAuthStateChanged listener]
    C --> D{User authenticated?}
    
    D -->|Yes| E[Get user data from Firebase]
    D -->|No| F[Show Home page]
    
    E --> G[Get user document from Firestore]
    G --> H{User document exists?}
    
    H -->|Yes| I[Load user data]
    H -->|No| J[Create user document]
    
    I --> K[Set user state in app]
    J --> K
    
    K --> L[Redirect to Dashboard]
    F --> M[User can access public pages]
    
    L --> N[User logged in - Full access]
    M --> O[User not logged in - Limited access]
    
    style A fill:#e1f5fe
    style L fill:#c8e6c9
    style F fill:#fff3e0
```

---

## 4. Error Handling Flow

```mermaid
flowchart TD
    A[Authentication Attempt] --> B{Error occurs?}
    B -->|No| C[Success - Continue flow]
    B -->|Yes| D[Get error code]
    
    D --> E{Error type?}
    
    E -->|Email/Password| F[Email/Password Error Handler]
    E -->|Google OAuth| G[Google OAuth Error Handler]
    
    F --> H{Error code?}
    H -->|auth/email-already-in-use| I[Show: 'Email already in use']
    H -->|auth/invalid-email| J[Show: 'Invalid email address']
    H -->|auth/weak-password| K[Show: 'Password must be at least 6 characters']
    H -->|auth/user-not-found| L[Show: 'Incorrect email or password']
    H -->|auth/wrong-password| L
    H -->|auth/too-many-requests| M[Show: 'Too many attempts. Try again later']
    H -->|default| N[Show: 'Something went wrong. Please try again']
    
    G --> O{Error code?}
    O -->|auth/popup-closed-by-user| P[Show: 'Sign-in was cancelled. Please try again']
    O -->|auth/popup-blocked| Q[Show: 'Pop-up was blocked by your browser']
    O -->|auth/cancelled-popup-request| P
    O -->|auth/account-exists-with-different-credential| R[Show: 'Account exists with different credentials']
    O -->|auth/operation-not-allowed| S[Show: 'Google sign-in is not enabled']
    O -->|auth/user-disabled| T[Show: 'This account has been disabled']
    O -->|auth/invalid-credential| U[Show: 'Invalid credentials. Please try again']
    O -->|default| V[Show: 'Google sign-in failed. Please try again']
    
    I --> W[Display error in UI]
    J --> W
    K --> W
    L --> W
    M --> W
    N --> W
    P --> W
    Q --> W
    R --> W
    S --> W
    T --> W
    U --> W
    V --> W
    
    W --> X[User can retry authentication]
    C --> Y[Continue to success flow]
    
    style A fill:#e1f5fe
    style Y fill:#c8e6c9
    style W fill:#ffcdd2
```

---

## 5. User Data Flow in Firestore

```mermaid
flowchart TD
    A[User Authentication Success] --> B{Authentication Method?}
    
    B -->|Email/Password| C[Email/Password User Data]
    B -->|Google OAuth| D[Google OAuth User Data]
    
    C --> E[Create/Update Firestore Document]
    D --> E
    
    E --> F[Document Structure]
    
    F --> G[uid: User's unique ID]
    F --> H[name: Display name]
    F --> I[email: User's email]
    F --> J[createdAt: Server timestamp]
    F --> K[updatedAt: Server timestamp]
    F --> L[role: 'user']
    F --> M[status: 'active']
    F --> N[provider: 'email' or 'google']
    F --> O[photoURL: Profile picture URL - Google only]
    
    G --> P[Document stored in 'users' collection]
    H --> P
    I --> P
    J --> P
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[User data available throughout app]
    
    style A fill:#e1f5fe
    style P fill:#c8e6c9
```

---

## 6. Navigation Flow After Authentication

```mermaid
flowchart TD
    A[User successfully authenticated] --> B[onAuthStateChanged triggers]
    B --> C[User state updated in app]
    C --> D[Redirect to Dashboard]
    
    D --> E[Dashboard loads]
    E --> F[Load user-specific data]
    F --> G[Show user profile information]
    G --> H[Display user's movie requests]
    H --> I[Show available actions]
    
    I --> J[User can request movies]
    I --> K[User can view profile]
    I --> L[User can access other features]
    
    J --> M[Payment flow for movie requests]
    K --> N[Profile management]
    L --> O[Other app features]
    
    style A fill:#e1f5fe
    style D fill:#c8e6c9
    style E fill:#c8e6c9
```

---

## 7. Security Flow

```mermaid
flowchart TD
    A[Authentication Request] --> B[Firebase Security Rules]
    B --> C{Request authorized?}
    
    C -->|Yes| D[Allow access]
    C -->|No| E[Block access]
    
    D --> F[User authenticated]
    E --> G[Access denied]
    
    F --> H[HTTPS required in production]
    F --> I[Domain verification]
    F --> J[Rate limiting]
    F --> K[Session management]
    
    G --> L[Show error message]
    
    style A fill:#e1f5fe
    style D fill:#c8e6c9
    style G fill:#ffcdd2
```

---

## Key Components in the Flow

### Frontend Components
- **Home.jsx**: Main landing page with authentication modal
- **Auth Modal**: Contains login/signup forms and Google button
- **Dashboard.jsx**: Protected page for authenticated users

### Backend Services
- **Firebase Authentication**: Handles user authentication
- **Firestore**: Stores user data and preferences
- **Google OAuth**: Third-party authentication provider

### State Management
- **onAuthStateChanged**: Listens for authentication state changes
- **React Router**: Handles navigation and protected routes
- **Local State**: Manages UI state (loading, errors, form data)

### Security Features
- **HTTPS**: Required for production
- **Domain Verification**: Configured in Firebase console
- **Rate Limiting**: Handled by Firebase
- **Session Persistence**: Configured for seamless experience

---

## Testing Scenarios

### Email/Password Authentication
1. **Valid Login**: Correct email and password
2. **Invalid Login**: Wrong email or password
3. **New Sign Up**: New user registration
4. **Existing Email**: Sign up with existing email
5. **Weak Password**: Password less than 6 characters
6. **Invalid Email**: Malformed email address

### Google OAuth Authentication
1. **Successful Login**: Valid Google account
2. **Popup Blocked**: Browser blocks popup
3. **User Cancels**: User closes popup
4. **Account Disabled**: Google account disabled
5. **Different Credentials**: Account exists with different method
6. **Network Error**: Connection issues

### General Scenarios
1. **Already Logged In**: User visits home page while authenticated
2. **Session Expiry**: User session expires
3. **Multiple Tabs**: User opens multiple tabs
4. **Browser Refresh**: Page refresh during authentication
5. **Network Issues**: Poor internet connection

---

## Error Codes Reference

### Email/Password Errors
- `auth/email-already-in-use`: Email already registered
- `auth/invalid-email`: Invalid email format
- `auth/weak-password`: Password too weak
- `auth/user-not-found`: User doesn't exist
- `auth/wrong-password`: Incorrect password
- `auth/too-many-requests`: Rate limit exceeded

### Google OAuth Errors
- `auth/popup-closed-by-user`: User closed popup
- `auth/popup-blocked`: Browser blocked popup
- `auth/cancelled-popup-request`: Popup cancelled
- `auth/account-exists-with-different-credential`: Account conflict
- `auth/operation-not-allowed`: Google auth not enabled
- `auth/user-disabled`: Account disabled
- `auth/invalid-credential`: Invalid credentials

This comprehensive flow documentation provides a complete understanding of the authentication system in MovieHub, covering all scenarios, error handling, and security considerations. 