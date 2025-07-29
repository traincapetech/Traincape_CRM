# 🚀 Complete Stripe Integration Setup Checklist

## ✅ **Step 1: Fix Stripe API Keys (CRITICAL)**

### 1.1 Get New API Keys
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. **Generate new keys** (current ones are expired)
4. Copy both keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### 1.2 Update Environment Variables
```bash
# In server/.env file, replace with new keys:
STRIPE_SECRET_KEY=sk_live_your_new_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_new_publishable_key_here
```

### 1.3 Test Connection
```bash
cd server
node scripts/testStripeConnection.js
```

## ✅ **Step 2: Set Up Webhook Endpoint (CRITICAL)**

### 2.1 Deploy Your Webhook URL
**Option A: Local Development (Testing)**
```bash
# Install ngrok globally
npm install -g ngrok

# Start your server
cd server && npm start

# In another terminal, create tunnel
ngrok http 8080

# Use the ngrok URL as your webhook endpoint
# Example: https://abc123.ngrok.io/api/stripe-invoices/webhook
```

**Option B: Production (Live)**
```bash
# Use your actual domain
# Example: https://yourdomain.com/api/stripe-invoices/webhook
```

### 2.2 Configure Webhook in Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL
4. Select these events:
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.finalized`
   - ✅ `invoice.voided`
5. Copy the **Webhook signing secret**

### 2.3 Add Webhook Secret to Environment
```bash
# In server/.env file, add:
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## ✅ **Step 3: Test the Complete Flow**

### 3.1 Start Both Servers
```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
cd client && npm start
```

### 3.2 Create Test Invoice
1. Open `http://localhost:3000`
2. Login to your CRM
3. Go to **Invoice Management** (blue card)
4. Create a regular invoice first
5. Save the invoice

### 3.3 Create Stripe Invoice
1. Go to **Stripe Invoices** (green card)
2. Select the CRM invoice you just created
3. Click **Create Stripe Invoice**
4. Check if invoice is created successfully

### 3.4 Test Payment Flow
1. Check your email for the Stripe invoice
2. Click the payment link
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Check if status updates in CRM

## ✅ **Step 4: Verify Everything Works**

### 4.1 Check Database Records
```bash
# Check if Stripe invoice was created
mongosh "your_mongodb_uri" --eval "db.stripeinvoices.find().pretty()"
```

### 4.2 Check Webhook Events
```bash
# Check server logs for webhook events
# Should see: "Payment succeeded for invoice: inv_..."
```

### 4.3 Verify Frontend Updates
1. Refresh Stripe Invoices page
2. Check if status changed to "paid"
3. Verify payment timestamp is recorded

## ✅ **Step 5: Production Deployment**

### 5.1 Update Production Environment
```bash
# Update production .env with live keys
STRIPE_SECRET_KEY=sk_live_production_key
STRIPE_WEBHOOK_SECRET=whsec_production_webhook_secret
```

### 5.2 Deploy Webhook Endpoint
```bash
# Ensure your production server is accessible
# Update webhook URL in Stripe dashboard
# Test webhook delivery
```

### 5.3 Final Testing
1. Create real invoice with real customer
2. Send payment link
3. Verify payment processing
4. Check automatic status updates

## 🎯 **What You'll Have After Setup**

### ✅ **Complete Payment Flow:**
1. **Create invoice** in CRM
2. **Convert to Stripe** invoice
3. **Customer gets email** with payment link
4. **Customer pays** on Stripe's secure page
5. **Payment status** updates automatically in CRM
6. **Revenue tracking** updates in real-time

### ✅ **Business Benefits:**
- **Professional payment processing**
- **Automatic payment tracking**
- **Real-time status updates**
- **Customer payment history**
- **Revenue analytics**
- **Failed payment insights**

## 🔧 **Troubleshooting**

### Common Issues:
1. **API Key Expired** → Generate new keys
2. **Webhook Not Receiving** → Check URL accessibility
3. **Payment Not Updating** → Verify webhook secret
4. **Server Crashes** → Check environment variables

### Debug Commands:
```bash
# Test Stripe connection
node scripts/testStripeConnection.js

# Check webhook setup
node scripts/setupStripeWebhook.js

# Check server logs
tail -f server/logs/app.log
```

## 🚀 **Ready to Go Live!**

Once all steps are completed:
1. **Test with real customers**
2. **Monitor payment success rates**
3. **Track revenue automatically**
4. **Scale your business**

---

**Need Help?** Check the troubleshooting section or contact support with specific error messages. 