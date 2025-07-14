# 🏢 CRM System - Complete Technical Documentation

## 📚 Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [Key Features](#key-features)
6. [Code Explanations](#code-explanations)

## 🌐 System Overview

Our CRM system is built using the MERN stack (MongoDB, Express.js, React, Node.js) with real-time features powered by Socket.IO.

### 🏗️ Architecture Layers:

1. **Frontend Layer**
   - React.js for UI
   - Context API for state management
   - Socket.IO client for real-time features
   - Web Audio API for notifications

2. **Backend Layer**
   - Node.js + Express.js server
   - JWT authentication
   - Socket.IO server
   - PDF generation

3. **Database Layer**
   - MongoDB for data storage
   - Mongoose for object modeling

## 💻 Frontend Architecture

### 📱 Pages and Their Purpose

1. **LoginPage (`/pages/LoginPage.jsx`)**
   ```jsx
   // Handles user authentication
   const LoginPage = () => {
     const { login } = useAuth();  // Get login function from AuthContext
     const handleSubmit = async (credentials) => {
       await login(credentials);  // Authenticate user
     };
   }
   ```

2. **DashboardPage (`/pages/DashboardPage.jsx`)**
   ```jsx
   // Shows overview of system
   const DashboardPage = () => {
     const [stats, setStats] = useState({
       totalEmployees: 0,
       pendingPayrolls: 0,
       activeChats: 0
     });
   }
   ```

3. **PayrollPage (`/pages/PayrollPage.jsx`)**
   ```jsx
   // Manages salary calculations
   const PayrollPage = () => {
     // Calculate salary based on 30 days
     const calculateSalary = (base, days) => (base / 30) * days;
   }
   ```

### 🔧 Components Breakdown

1. **PayrollComponent**
   ```jsx
   // Handles salary generation
   const PayrollComponent = () => {
     // Base salary calculation
     const baseSalary = 30000;
     const daysPresent = 25;
     const calculatedSalary = (baseSalary / 30) * daysPresent;
   }
   ```

2. **ChatComponent**
   ```jsx
   // Real-time messaging
   const ChatComponent = () => {
     useEffect(() => {
       // Connect to WebSocket
       socket.on('message', handleNewMessage);
       // Play notification sound
       notificationService.playMessageSound();
     }, []);
   }
   ```

## 🖥️ Backend Architecture

### 📡 API Routes

1. **Authentication Routes**
   ```javascript
   // auth.routes.js
   router.post('/login', authController.login);
   router.post('/register', authController.register);
   ```

2. **Payroll Routes**
   ```javascript
   // payroll.routes.js
   router.post('/generate', payrollController.generate);
   router.get('/:id/salary-slip', payrollController.generatePDF);
   ```

### 🎮 Controllers

1. **Payroll Controller**
   ```javascript
   // Salary calculation logic
   const calculateSalary = (baseSalary, daysPresent) => {
     // Always use 30 days as base
     return (baseSalary / 30) * daysPresent;
   };
   ```

2. **Chat Controller**
   ```javascript
   // Handle real-time messages
   io.on('connection', (socket) => {
     socket.on('message', async (msg) => {
       // Store in database
       await Message.create(msg);
       // Broadcast to recipients
       io.to(msg.room).emit('message', msg);
     });
   });
   ```

## 📊 Database Schema

### 👤 User Model
```javascript
const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'HR', 'Manager', 'Employee'] }
});
```

### 💰 Payroll Model
```javascript
const payrollSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  baseSalary: Number,
  daysPresent: Number,
  calculatedSalary: Number
});
```

## 🔑 Key Features

### 1️⃣ Authentication System
- JWT-based authentication
- Role-based access control
- Secure password hashing

### 2️⃣ Payroll System
- 30-days base calculation
- Automatic salary proration
- PDF slip generation (10KB-20KB)

### 3️⃣ Chat System
- Real-time messaging
- WhatsApp-style notifications
- Online/offline status

## 🧩 Code Explanations

### 1. Salary Calculation
```javascript
// This is how we calculate prorated salary
const calculateSalary = (baseSalary, daysPresent) => {
  // We ALWAYS use 30 days as base
  // Example: If base salary is 30,000 and employee present for 15 days
  // Calculation: (30,000 / 30) * 15 = 15,000
  return (baseSalary / 30) * daysPresent;
};
```

### 2. Chat Notification
```javascript
// This plays WhatsApp-style sounds
const playNotification = async () => {
  const audioContext = new AudioContext();
  const source = audioContext.createBufferSource();
  source.buffer = await loadSound('message.mp3');
  source.connect(audioContext.destination);
  source.start(0);
};
```

### 3. PDF Generation
```javascript
// This generates size-optimized PDFs
const generatePDF = (data) => {
  const doc = new PDFDocument();
  // Use smaller fonts and optimized images
  doc.fontSize(8);
  doc.image('logo.jpg', { width: 60 });
  // Monitor file size
  let size = 0;
  doc.on('data', chunk => size += chunk.length);
};
```

## 🔄 Data Flow Examples

### Example 1: Login Process
1. User enters credentials in `LoginPage`
2. `AuthContext` sends request to `/api/auth/login`
3. Backend validates and returns JWT
4. Token stored in `localStorage`
5. User redirected to `DashboardPage`

### Example 2: Salary Calculation
1. HR enters data in `PayrollComponent`
2. Frontend calculates initial salary
3. Data sent to `/api/payroll/generate`
4. Backend validates and stores in MongoDB
5. PDF generated and sent back

### Example 3: Chat Message
1. User types in `ChatComponent`
2. Message sent via Socket.IO
3. Backend stores in MongoDB
4. Recipients notified via WebSocket
5. Sound played using Web Audio API

## 🛠️ Development Guidelines

1. **Frontend Development**
   - Use functional components
   - Implement proper error handling
   - Follow responsive design principles

2. **Backend Development**
   - Validate all inputs
   - Implement proper error handling
   - Keep PDF size between 10KB-20KB

3. **Database Operations**
   - Use proper indexing
   - Implement data validation
   - Follow MongoDB best practices 