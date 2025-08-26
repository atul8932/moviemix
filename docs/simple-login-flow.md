# Simple Login Flow Diagram

## Overview
A simplified visual representation of the login process in MovieHub.

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOVIEHUB LOGIN FLOW                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USER      │    │   AUTH      │    │  SUCCESS    │
│  ENTRY      │    │  MODAL      │    │   FLOW      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Visit Home  │    │ Choose Auth │    │ Redirect to │
│   Page      │───▶│   Method    │───▶│ Dashboard   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌─────────────┐ ┌─────────────┐
            │ Email/Pass  │ │   Google    │
            │   Login     │ │   OAuth     │
            └─────────────┘ └─────────────┘
                    │             │
                    ▼             ▼
            ┌─────────────┐ ┌─────────────┐
            │ Enter Creds │ │ Google Popup│
            │   & Submit  │ │   & Grant   │
            └─────────────┘ └─────────────┘
                    │             │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  Firebase   │
                    │  Auth Check │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ Create User │
                    │ Document in │
                    │  Firestore  │
                    └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Dashboard  │
                    │   Access    │
                    └─────────────┘
```

## Authentication Methods Comparison

### Email/Password Authentication
```
┌─────────────────────────────────────────────────────────────┐
│                    EMAIL/PASSWORD FLOW                      │
├─────────────────────────────────────────────────────────────┤
│ 1. User enters email & password                            │
│ 2. Form validation                                         │
│ 3. Firebase authentication                                 │
│ 4. Create/update user profile                              │
│ 5. Store in Firestore                                      │
│ 6. Redirect to dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

### Google OAuth Authentication
```
┌─────────────────────────────────────────────────────────────┐
│                      GOOGLE OAUTH FLOW                     │
├─────────────────────────────────────────────────────────────┤
│ 1. User clicks "Sign In with Google"                       │
│ 2. Google popup opens                                      │
│ 3. User selects account & grants permissions               │
│ 4. Google returns user data                                │
│ 5. Firebase creates/updates user account                   │
│ 6. Store in Firestore with Google profile data             │
│ 7. Redirect to dashboard                                   │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ERROR HANDLING FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                    Authentication Attempt                   │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Error Occurs? │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │   Yes           │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │  Get Error Code │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │ Map to User-    │                      │
│                    │ Friendly Message│                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │ Display Error   │                      │
│                    │ in UI           │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                    ┌────────▼────────┐                      │
│                    │ User Can Retry  │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## User Data Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DOCUMENT STRUCTURE                  │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   uid: "user_unique_id",                                   │
│   name: "User Display Name",                               │
│   email: "user@example.com",                               │
│   createdAt: serverTimestamp(),                            │
│   updatedAt: serverTimestamp(),                            │
│   role: "user",                                            │
│   status: "active",                                        │
│   provider: "email" | "google",                            │
│   photoURL: "https://..." // Google only                   │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY FEATURES                      │
├─────────────────────────────────────────────────────────────┤
│ 🔒 HTTPS Required (Production)                             │
│ 🔒 Domain Verification (Firebase Console)                  │
│ 🔒 Rate Limiting (Firebase)                                │
│ 🔒 Session Persistence (Browser Local)                     │
│ 🔒 Secure Error Handling (No Sensitive Data)               │
│ 🔒 Firestore Security Rules                                │
└─────────────────────────────────────────────────────────────┘
```

## Success Indicators

```
┌─────────────────────────────────────────────────────────────┐
│                    SUCCESS INDICATORS                       │
├─────────────────────────────────────────────────────────────┤
│ ✅ User redirected to dashboard                            │
│ ✅ User document created in Firestore                      │
│ ✅ Authentication state maintained                         │
│ ✅ User can access protected features                      │
│ ✅ Profile information displayed correctly                 │
└─────────────────────────────────────────────────────────────┘
```

## Common Error Scenarios

```
┌─────────────────────────────────────────────────────────────┐
│                   COMMON ERROR SCENARIOS                    │
├─────────────────────────────────────────────────────────────┤
│ ❌ Invalid email format                                    │
│ ❌ Weak password (< 6 characters)                          │
│ ❌ Email already in use                                    │
│ ❌ Wrong email/password combination                        │
│ ❌ Google popup blocked by browser                         │
│ ❌ User cancels Google authentication                      │
│ ❌ Network connectivity issues                             │
│ ❌ Firebase service unavailable                            │
└─────────────────────────────────────────────────────────────┘
```

This simplified flow diagram provides a clear visual representation of the login process, making it easy to understand the user journey and system interactions. 