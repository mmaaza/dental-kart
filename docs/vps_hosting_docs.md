# DK Nepal MERN Stack Deployment Guide - Without Docker
## Hosting DK Nepal E-commerce Platform on Hostinger VPS with SSL

This guide will help you deploy **DK Nepal (Dental Kart Nepal)** e-commerce platform on Hostinger VPS using traditional deployment methods with Nginx reverse proxy and SSL certificates.

## Prerequisites

- Hostinger VPS (Ubuntu 20.04 or later)
- Domain name: `dentalkartnepal.com`
- Basic knowledge of Linux commands and server management
- SSH access to your VPS

## Step 1: Initial VPS Setup

### Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl wget git nano ufw build-essential
```

### Configure Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw status
```

## Step 2: Install Node.js and npm

### Install Node.js via NodeSource
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 3: Install MongoDB

### Add MongoDB Repository
```bash
# Import MongoDB public key
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
```

### Secure MongoDB
```bash
# Connect to MongoDB
mongo

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "your_strong_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create database and user for DK Nepal project
use dknepal
db.createUser({
  user: "dknepal_user",
  pwd: "dknepal_password",
  roles: ["readWrite"]
})

exit
```

### Enable Authentication
```bash
sudo nano /etc/mongod.conf
```

Add these lines:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

## Step 4: Install PM2 Process Manager

```bash
sudo npm install -g pm2
```

## Step 5: Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

## Step 6: Domain Configuration

### Configure DNS Records
For your domain, add these DNS records:
- **A Record**: `@` → Your VPS IP
- **A Record**: `www` → Your VPS IP

Wait for DNS propagation (usually 5-15 minutes).

## Step 7: Prepare Project Structure

```bash
# Create main project directory
sudo mkdir -p /var/www
cd /var/www

# Create directory for DK Nepal project
sudo mkdir -p dknepal

# Change ownership
sudo chown -R $USER:$USER /var/www/dknepal
```

## Step 8: Deploy DK Nepal Project

### Clone and Setup Backend
```bash
cd /var/www/dknepal

# Clone your project
git clone https://github.com/your-username/dknepal.git .

# Install backend dependencies
cd backend
npm install

# Create environment file
nano .env
```

Add environment variables:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://dknepal_user:dknepal_password@localhost:27017/dknepal
JWT_SECRET=your_jwt_secret_here
BREVO_API_KEY=your_brevo_api_key_here
```

### Build and Setup Frontend
```bash
cd /var/www/dknepal

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add production environment:
```env
VITE_API_URL=https://dentalkartnepal.com/api
```

```bash
# Build for production using Vite
npm run build

# Copy build files to nginx directory
sudo mkdir -p /var/www/html/dentalkartnepal.com
sudo cp -r dist/* /var/www/html/dentalkartnepal.com/
```

### Start Backend with PM2
```bash
cd /var/www/dknepal/backend

# Start with PM2 (note: entry point is src/index.js)
pm2 start src/index.js --name dknepal-backend --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

## Step 9: Configure Nginx

### Remove Default Configuration
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Create Configuration for DK Nepal
```bash
sudo nano /etc/nginx/sites-available/dentalkartnepal.com
```

Add configuration:
```nginx
server {
    listen 80;
    server_name dentalkartnepal.com www.dentalkartnepal.com;

    root /var/www/html/dentalkartnepal.com;
    index index.html;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```


### Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dentalkartnepal.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 10: Install SSL Certificates with Certbot

### Install Certbot
```bash
sudo apt update
sudo apt install python3 python3-venv libaugeas0 -y

# Create virtual environment for certbot
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-nginx

# Create symlink
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```

### Obtain SSL Certificates
```bash
# Get certificate for your domain
sudo certbot --nginx -d dentalkartnepal.com -d www.dentalkartnepal.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## Step 11: Final Steps and Monitoring

### Check PM2 Status
```bash
pm2 status
pm2 logs dknepal-backend
```

### Monitor System Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop
```

### Useful Commands for Maintenance
```bash
# Restart backend
pm2 restart dknepal-backend

# View logs
pm2 logs dknepal-backend

# Reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx

# Check MongoDB status
sudo systemctl status mongod
```

## Troubleshooting

### Common Issues
1. **Port already in use**: Check if another process is using port 5000
2. **Permission denied**: Ensure proper file permissions for uploads directory
3. **Build files not found**: Check if Vite build created `dist/` directory
4. **API not connecting**: Verify environment variables and MongoDB connection

### Logs to Check
- PM2 logs: `pm2 logs dknepal-backend`
- Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`