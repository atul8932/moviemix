# 🎬 MovieMix - Movie Request & Download Platform

A modern web application for requesting and downloading movies optimized for specific mobile devices. Built with React, Firebase, and a beautiful UI/UX design.

## ✨ Features

### 🎯 Core Functionality
- **Movie Requests**: Submit requests with mobile model and movie name
- **Real-time Status Tracking**: Live updates on request processing
- **Payment Integration**: Secure Razorpay payment processing
- **Download Management**: Optimized downloads for specific devices
- **Order History**: Track all your movie requests

### 🎨 User Interface
- **Modern Landing Page**: Hero section with authentication modal
- **Dashboard**: Sidebar navigation with quick request form
- **Waiting Page**: Interactive countdown timer with progress animation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Status Indicators**: Visual chips for request status (Waiting, Ready, Failed)

### 🔧 Technical Features
- **Real-time Updates**: Firebase Firestore integration
- **Authentication**: User login/signup system
- **Search & Filter**: Find and filter your orders
- **Payment Processing**: Secure payment verification
- **Admin Panel**: Manage requests and upload downloads

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (recommended)
- npm or yarn
- Firebase project
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moviemix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Add your Firebase config to `src/firebase.js`

4. **Set up Razorpay (Optional)**
   - Create a Razorpay account
   - Get your API keys
   - Configure payment settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to http://localhost:5173/
   - Start using MovieMix!

## 📁 Project Structure

```
moviemix/
├── src/
│   ├── components/
│   │   ├── Home.jsx              # Landing page with auth
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── WaitingPage.jsx       # Request processing page
│   │   ├── AdminPanel.jsx        # Admin management
│   │   └── styles.css            # Global styles
│   ├── App.jsx                   # Main app component
│   ├── firebase.js               # Firebase configuration
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Base styles
├── public/                       # Static assets
├── functions/                    # Firebase Functions (if deployed)
├── package.json
└── README.md
```

## 🎯 User Flow

### 1. Landing Page
- **Hero Section**: Beautiful gradient background with call-to-action
- **Authentication**: Login/Signup modal with tab switching
- **Navigation**: Header with logo and auth buttons

### 2. Dashboard
- **Sidebar**: Navigation menu with icons
- **Quick Request**: Form to submit movie requests
- **Recent Orders**: Table with search and filter
- **Top Navbar**: Search functionality and user menu

### 3. Request Process
- **Form Submission**: Mobile model + Movie name
- **Payment**: Secure Razorpay integration
- **Waiting Page**: 5-minute countdown with progress
- **Download**: Ready when processing completes

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **CSS3**: Modern styling with CSS variables

### Backend
- **Firebase Firestore**: Real-time database
- **Firebase Functions**: Serverless backend (optional)
- **Razorpay**: Payment processing

### Styling
- **Google Fonts**: Poppins (headings) + Inter (body)
- **CSS Variables**: Consistent design system
- **Responsive Design**: Mobile-first approach

## 🎨 Design System

### Colors
```css
--primary-blue: #1E3A8A    /* Main brand color */
--accent-green: #10B981    /* Success/CTA color */
--light-bg: #F9FAFB        /* Background color */
--status-yellow: #FBBF24   /* Waiting status */
--status-green: #22C55E    /* Ready status */
--status-red: #EF4444      /* Failed status */
```

### Typography
- **Headings**: Poppins (600 weight)
- **Body**: Inter (400 weight)
- **Buttons**: Inter (500 weight)

### Components
- **Buttons**: Primary, Secondary, Text variants
- **Forms**: Consistent input styling with focus states
- **Cards**: Rounded corners with subtle shadows
- **Status Chips**: Color-coded status indicators

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Update `src/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Razorpay Setup (Optional)
1. Create Razorpay account
2. Get API keys from dashboard
3. Configure payment settings
4. Update payment integration code

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Mobile Features
- Collapsible sidebar
- Touch-friendly buttons
- Optimized form layouts
- Responsive tables

## 🔒 Security Features

- **Payment Verification**: Server-side signature verification
- **Input Validation**: Client and server-side validation
- **Secure Routes**: Protected admin routes
- **Data Sanitization**: Clean user inputs

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📊 Database Schema

### Movie Requests Collection
```javascript
{
  id: "auto-generated",
  mobile: "iPhone 15",
  movieName: "Inception",
  email: "user@example.com",
  status: "pending" | "completed" | "failed",
  paymentStatus: "pending" | "success" | "cancelled",
  downloadLink: "https://...",
  createdAt: "timestamp"
}
```

## 🎯 API Endpoints

### Frontend Routes
- `/` - Landing page
- `/dashboard` - Main dashboard
- `/waiting/:mobile` - Request processing page
- `/admin` - Admin panel

### Firebase Functions (if deployed)
- `createOrder` - Create Razorpay order
- `verifyPayment` - Verify payment signature

## 🐛 Troubleshooting

### Common Issues

1. **Node Version**
   ```bash
   # Use Node 20+ for best compatibility
   nvm use 20
   ```

2. **Firebase Connection**
   - Check Firebase config in `src/firebase.js`
   - Ensure Firestore is enabled
   - Verify security rules

3. **Payment Issues**
   - Check Razorpay API keys
   - Verify webhook configuration
   - Test with sandbox mode

4. **Build Errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase and Razorpay documentation

---

**Built with ❤️ using React, Firebase, and modern web technologies**
