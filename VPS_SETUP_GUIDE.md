# VPS Setup Guide for 15-20 Employee Team

## 🚀 **VPS Recommendations for Your Team**

### **Recommended VPS Specifications**
- **CPU**: 2-4 cores
- **RAM**: 4-8GB
- **Storage**: 50-100GB SSD
- **Bandwidth**: 1-2TB/month
- **Cost**: $20-50/month

### **Best VPS Providers for Your Use Case**
1. **DigitalOcean** - $20-40/month, excellent documentation
2. **Linode** - $20-40/month, great performance
3. **Vultr** - $20-35/month, good value
4. **AWS Lightsail** - $20-40/month, easy AWS integration

## 📋 **Step-by-Step VPS Setup**

### **1. Initial Server Setup**
```bash
# Connect to your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# Install Nginx
apt install -y nginx

# Install SSL certificate tool
apt install -y certbot python3-certbot-nginx
```

### **2. Create Directory Structure**
```bash
# Create app directory
mkdir -p /var/www/crm
cd /var/www/crm

# Clone your repository
git clone https://github.com/yourusername/crm.git .

# Create uploads directory
mkdir -p /var/www/crm/uploads/documents
chmod 755 /var/www/crm/uploads/documents

# Create backup directory
mkdir -p /var/backups/crm
chmod 755 /var/backups/crm

# Create log directory
mkdir -p /var/log/crm
chmod 755 /var/log/crm
```

### **3. Configure Environment**
```bash
# Copy production environment file
cp server/config/production.sample.env server/.env.production

# Edit with your actual values
nano server/.env.production
```

### **4. Install Dependencies**
```bash
# Install server dependencies
cd server
npm install --production

# Install client dependencies and build
cd ../client
npm install
npm run build
```

### **5. Setup MongoDB**
```bash
# Start MongoDB service
systemctl start mongod
systemctl enable mongod

# Create database user
mongo
use crm_production
db.createUser({
  user: "crmuser",
  pwd: "secure-password-here",
  roles: [{ role: "readWrite", db: "crm_production" }]
})
exit
```

### **6. Configure Nginx**
```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/crm
```

```nginx
server {
    listen 80;
    server_name yourcrm.com www.yourcrm.com;

    # Frontend - React build
    location / {
        root /var/www/crm/client/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Document uploads (secured)
    location /uploads {
        root /var/www/crm;
        # Add authentication check here
        try_files $uri =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # File upload limits
    client_max_body_size 10M;
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### **7. SSL Certificate**
```bash
# Get SSL certificate
certbot --nginx -d yourcrm.com -d www.yourcrm.com
```

### **8. Start Application**
```bash
# Start with PM2
cd /var/www/crm/server
pm2 start server.js --name "crm-backend" --env production
pm2 startup
pm2 save
```

## 🔧 **Backup Script for Your Team**

```bash
# Create backup script
nano /usr/local/bin/backup-crm.sh
```

```bash
#!/bin/bash

# CRM Backup Script for 15-20 Employee Team
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/crm"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db crm_production --out $BACKUP_DIR/db_$DATE

# Backup uploaded documents
tar -czf $BACKUP_DIR/documents_$DATE.tar.gz /var/www/crm/uploads/documents/

# Backup application code (optional)
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/crm/ --exclude=/var/www/crm/uploads --exclude=/var/www/crm/node_modules

# Remove old backups
find $BACKUP_DIR -name "db_*" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-crm.sh

# Setup cron job for daily backups
crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-crm.sh >> /var/log/crm/backup.log 2>&1
```

## 📊 **Monitoring Setup**

### **Simple Monitoring Script**
```bash
# Create monitoring script
nano /usr/local/bin/monitor-crm.sh
```

```bash
#!/bin/bash

# CRM Health Check
LOG_FILE="/var/log/crm/health.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if backend is running
if ! pm2 show crm-backend > /dev/null 2>&1; then
    echo "[$DATE] ERROR: Backend is down, restarting..." >> $LOG_FILE
    pm2 restart crm-backend
fi

# Check MongoDB
if ! systemctl is-active --quiet mongod; then
    echo "[$DATE] ERROR: MongoDB is down, restarting..." >> $LOG_FILE
    systemctl restart mongod
fi

# Check disk space
DISK_USAGE=$(df /var/www/crm/uploads | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is at $DISK_USAGE%" >> $LOG_FILE
fi

# Check document count (for 15-20 employees, expect 300-2000 documents)
DOC_COUNT=$(find /var/www/crm/uploads/documents -type f | wc -l)
echo "[$DATE] INFO: Total documents: $DOC_COUNT" >> $LOG_FILE

# Log health status
echo "[$DATE] INFO: System healthy" >> $LOG_FILE
```

```bash
# Make executable
chmod +x /usr/local/bin/monitor-crm.sh

# Setup cron job for monitoring every 30 minutes
crontab -e
# Add this line:
*/30 * * * * /usr/local/bin/monitor-crm.sh
```

## 💰 **Cost Breakdown for Your Team**

### **Monthly VPS Costs**
- **VPS**: $20-40/month
- **Domain**: $1-2/month
- **SSL**: Free (Let's Encrypt)
- **Backup Storage**: $5-10/month (optional external)
- **Total**: $26-52/month

### **Scalability Timeline**
- **Current (15-20 employees)**: Basic VPS
- **Growth (25-50 employees)**: Upgrade to higher tier VPS
- **Scale (50+ employees)**: Consider load balancing or cloud migration

## 🔐 **Security Best Practices**

1. **Regular Updates**: `apt update && apt upgrade` monthly
2. **Firewall**: Only allow ports 22, 80, 443
3. **SSH Key Authentication**: Disable password authentication
4. **Regular Backups**: Daily automated backups
5. **Log Monitoring**: Review logs weekly
6. **SSL Certificate**: Auto-renewal with certbot

## 🚨 **Emergency Procedures**

### **If Backend Crashes**
```bash
pm2 restart crm-backend
pm2 logs crm-backend
```

### **If Database Issues**
```bash
systemctl restart mongod
mongod --repair
```

### **If Disk Space Full**
```bash
# Clean old logs
find /var/log -name "*.log" -type f -mtime +30 -delete

# Clean old backups
find /var/backups/crm -mtime +30 -delete
```

This setup should handle your 15-20 employee team perfectly! 🎯 