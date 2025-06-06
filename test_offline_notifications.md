# 🧪 Testing Offline Chat Notifications

## 📋 **Test Scenario: User Receives Messages While Offline**

### **Step 1: Setup Two Users**
1. **User A** (Sender) - Stays logged in
2. **User B** (Receiver) - Will go offline

### **Step 2: Enable Browser Notifications**
1. Login as **User B**
2. Click the **🐛 Debug Chat** button
3. Click **"Request Permission"** for browser notifications
4. Allow notifications when browser prompts

### **Step 3: Test Offline Message Reception**

#### **Method 1: Close Browser Tab**
1. **User B** closes browser tab (or entire browser)
2. **User A** sends messages to **User B**
3. **Expected Results:**
   - ✅ Messages stored in database
   - ✅ Browser notification appears (even with tab closed)
   - ✅ Sound notification plays (if browser supports it)

#### **Method 2: Logout Test**
1. **User B** logs out of CRM
2. **User A** sends messages to **User B**
3. **User B** logs back in
4. **Expected Results:**
   - ✅ Unread message count appears on chat button
   - ✅ Messages appear in chat history
   - ✅ Toast notification shows new messages

### **Step 4: Verify Message Persistence**

#### **Database Check:**
```bash
# Check messages in MongoDB
# Messages should be stored even when user is offline
```

#### **UI Check:**
- Red badge on chat button showing unread count
- Bold text for unread conversations
- Messages appear when chat is opened

## 🔔 **Notification Types Available**

### **1. Browser Notifications (Primary for Offline)**
```javascript
// Appears even when browser is minimized/closed
"New message from John Doe: Hello, how are you?"
```

### **2. In-App Notifications (When Online)**
```javascript
// Toast notifications within the CRM
toast.info("New message from John Doe: Hello...")
```

### **3. Visual Indicators**
- 🔴 Red badge with unread count
- 📱 Bold text for unread chats
- 🟢 Green dot for online users

### **4. Sound Alerts**
- 🔊 Notification beep for new messages
- 🎵 Different sounds for different message types

## 🧪 **Quick Test Commands**

### **Test 1: Browser Notification Permission**
1. Open browser console (F12)
2. Run: `Notification.requestPermission()`
3. Should return: `"granted"`, `"denied"`, or `"default"`

### **Test 2: Manual Browser Notification**
```javascript
// Run in browser console
new Notification("Test CRM Chat", {
  body: "This is a test notification",
  icon: "/favicon.ico"
});
```

### **Test 3: Check Notification Service Status**
1. Login to CRM
2. Open browser console
3. Look for: `"✅ Connected to notification server"`

## 📱 **Mobile Device Testing**

### **Mobile Browser Notifications**
1. Open CRM on mobile browser
2. Enable notifications when prompted
3. Close browser app (don't just minimize)
4. Send message from another device
5. Should receive push notification

## 🔧 **Troubleshooting Offline Notifications**

### **If Browser Notifications Don't Work:**

#### **Check 1: Permission Status**
```javascript
// In browser console
console.log(Notification.permission);
// Should be "granted"
```

#### **Check 2: Browser Support**
```javascript
// In browser console
console.log('Notification' in window);
// Should be true
```

#### **Check 3: Site Settings**
1. Click lock icon in address bar
2. Check if notifications are allowed
3. Reset if needed

### **If Messages Don't Persist:**

#### **Check 1: Database Connection**
- Server should be connected to MongoDB
- Check server console for connection errors

#### **Check 2: Authentication**
- User should be properly logged in
- JWT token should be valid

## ✅ **Expected Behavior Summary**

### **When User is Online:**
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Instant notifications

### **When User is Offline:**
- ✅ Messages stored in database
- ✅ Browser notifications (if permission granted)
- ✅ Unread counts tracked
- ✅ Messages appear when user returns

### **When User Returns Online:**
- ✅ All missed messages loaded
- ✅ Unread counts displayed
- ✅ Notification summary shown
- ✅ Chat history preserved

## 🎯 **Success Criteria**

Your offline notification system is working correctly if:

1. **Messages persist** when recipient is offline
2. **Browser notifications** appear even with tab closed
3. **Unread counts** show when user returns
4. **Chat history** is preserved
5. **No messages are lost** during offline periods

The system is designed to ensure **zero message loss** and **comprehensive notification coverage** for all user scenarios! 