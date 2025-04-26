# Deployment Guide

This guide provides detailed instructions for deploying the Chainocracy blockchain-based voting system to production environments.

## Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Backend API Deployment](#backend-api-deployment)
   - [Traditional Server Deployment](#traditional-server-deployment)
   - [Docker Deployment](#docker-deployment)
   - [Cloud Platform Deployment](#cloud-platform-deployment)
4. [Web Frontend Deployment](#web-frontend-deployment)
   - [Static Hosting](#static-hosting)
   - [Server-Side Rendering](#server-side-rendering)
5. [Mobile Frontend Deployment](#mobile-frontend-deployment)
   - [App Store Submission](#app-store-submission)
   - [Google Play Store Submission](#google-play-store-submission)
   - [Enterprise Distribution](#enterprise-distribution)
6. [Database Setup](#database-setup)
7. [Blockchain Node Configuration](#blockchain-node-configuration)
8. [Security Considerations](#security-considerations)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Backup and Recovery](#backup-and-recovery)
11. [Scaling Strategies](#scaling-strategies)
12. [Troubleshooting](#troubleshooting)

## Deployment Overview

The Chainocracy system consists of three main components that need to be deployed:

1. **Backend API**: Node.js/Express.js server that manages the blockchain and business logic
2. **Web Frontend**: React application for election committee members
3. **Mobile Frontend**: React Native application for voters

Each component has different deployment requirements and considerations.

## Prerequisites

Before deploying, ensure you have:

- Access to production servers or cloud platforms
- Domain names configured for the web application and API
- SSL certificates for secure HTTPS connections
- Database infrastructure set up
- CI/CD pipeline configured (optional but recommended)
- Monitoring tools in place

## Backend API Deployment

### Traditional Server Deployment

#### Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or later
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 100+ GB SSD
- **Network**: 100+ Mbps connection

#### Deployment Steps

1. **Prepare the server**:

   ```bash
   # Update the system
   sudo apt update
   sudo apt upgrade -y

   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Set up the application directory**:

   ```bash
   # Create application directory
   sudo mkdir -p /opt/chainocracy/backend
   sudo chown -R $USER:$USER /opt/chainocracy
   ```

3. **Deploy the application code**:

   ```bash
   # Clone the repository or copy the files
   git clone https://github.com/abrar2030/chainocracy.git /tmp/chainocracy
   cp -R /tmp/chainocracy/backend-api/* /opt/chainocracy/backend/
   cd /opt/chainocracy/backend

   # Install dependencies
   npm install --production
   ```

4. **Configure environment variables**:

   ```bash
   # Create environment file
   cp .env.example .env
   nano .env
   ```

   Update the following variables:
   - `PORT`: API server port (e.g., 3010)
   - `NODE_ENV`: Set to "production"
   - `JWT_SECRET`: Strong random string for JWT signing
   - `BLOCKCHAIN_NODE_ADDRESS`: Public address of the blockchain node
   - `DATABASE_PATH`: Path to the blockchain database
   - `CORS_ORIGIN`: Allowed origins for CORS

5. **Start the application with PM2**:

   ```bash
   # Start the application
   pm2 start npm --name "chainocracy-backend" -- start

   # Configure PM2 to start on boot
   pm2 startup
   pm2 save
   ```

6. **Set up Nginx as a reverse proxy**:

   ```bash
   # Install Nginx
   sudo apt install -y nginx

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/chainocracy-backend
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name api.chainocracy.com;

       location / {
           proxy_pass http://localhost:3010;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/chainocracy-backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Set up SSL with Let's Encrypt**:

   ```bash
   # Install Certbot
   sudo apt install -y certbot python3-certbot-nginx

   # Obtain SSL certificate
   sudo certbot --nginx -d api.chainocracy.com
   ```

### Docker Deployment

1. **Install Docker and Docker Compose**:

   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Create Docker Compose file**:

   ```bash
   mkdir -p /opt/chainocracy
   cd /opt/chainocracy
   nano docker-compose.yml
   ```

   Add the following content:

   ```yaml
   version: '3.8'

   services:
     backend:
       build:
         context: ./backend-api
         dockerfile: Dockerfile
       restart: always
       ports:
         - "3010:3010"
       environment:
         - NODE_ENV=production
         - PORT=3010
         - JWT_SECRET=your_jwt_secret
         - BLOCKCHAIN_NODE_ADDRESS=your_node_address
         - DATABASE_PATH=/app/data/blockchain
         - CORS_ORIGIN=https://chainocracy.com
       volumes:
         - blockchain-data:/app/data

   volumes:
     blockchain-data:
   ```

3. **Deploy the application**:

   ```bash
   # Clone the repository
   git clone https://github.com/abrar2030/chainocracy.git /tmp/chainocracy
   cp -R /tmp/chainocracy/backend-api /opt/chainocracy/

   # Start the containers
   cd /opt/chainocracy
   docker-compose up -d
   ```

4. **Set up Nginx as a reverse proxy** (follow the same steps as in the traditional deployment)

### Cloud Platform Deployment

#### AWS Elastic Beanstalk

1. **Install the EB CLI**:

   ```bash
   pip install awsebcli
   ```

2. **Configure the application for Elastic Beanstalk**:

   Create a `.ebextensions` directory in the project root:

   ```bash
   mkdir -p backend-api/.ebextensions
   ```

   Create a configuration file:

   ```bash
   nano backend-api/.ebextensions/nodecommand.config
   ```

   Add the following content:

   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm start"
     aws:elasticbeanstalk:application:environment:
       NODE_ENV: production
       PORT: 8081
   ```

3. **Initialize and deploy the application**:

   ```bash
   cd backend-api
   eb init
   # Follow the prompts to configure your application
   eb create chainocracy-backend-prod
   ```

4. **Configure environment variables**:

   ```bash
   eb setenv JWT_SECRET=your_jwt_secret BLOCKCHAIN_NODE_ADDRESS=your_node_address DATABASE_PATH=/var/app/current/data/blockchain CORS_ORIGIN=https://chainocracy.com
   ```

#### Google Cloud Run

1. **Install the Google Cloud SDK**:

   Follow the instructions at: https://cloud.google.com/sdk/docs/install

2. **Build and push the Docker image**:

   ```bash
   cd backend-api
   gcloud builds submit --tag gcr.io/your-project-id/chainocracy-backend
   ```

3. **Deploy to Cloud Run**:

   ```bash
   gcloud run deploy chainocracy-backend \
     --image gcr.io/your-project-id/chainocracy-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="NODE_ENV=production,JWT_SECRET=your_jwt_secret,BLOCKCHAIN_NODE_ADDRESS=your_node_address,CORS_ORIGIN=https://chainocracy.com"
   ```

## Web Frontend Deployment

### Static Hosting

The web frontend is a React application that can be built into static files and hosted on various platforms.

#### Build the Application

```bash
cd web-frontend
npm install
npm run build
```

This creates a `dist` directory with the built application.

#### Deploy to Nginx

1. **Copy the built files to the server**:

   ```bash
   scp -r dist/* user@your-server:/var/www/chainocracy-web/
   ```

2. **Configure Nginx**:

   ```bash
   sudo nano /etc/nginx/sites-available/chainocracy-web
   ```

   Add the following configuration:

   ```nginx
   server {
       listen 80;
       server_name chainocracy.com www.chainocracy.com;
       root /var/www/chainocracy-web;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
           expires 1y;
           add_header Cache-Control "public, max-age=31536000";
       }
   }
   ```

   Enable the site:

   ```bash
   sudo ln -s /etc/nginx/sites-available/chainocracy-web /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Set up SSL with Let's Encrypt**:

   ```bash
   sudo certbot --nginx -d chainocracy.com -d www.chainocracy.com
   ```

#### Deploy to AWS S3 and CloudFront

1. **Create an S3 bucket**:

   ```bash
   aws s3 mb s3://chainocracy-web
   ```

2. **Configure the bucket for static website hosting**:

   ```bash
   aws s3 website s3://chainocracy-web --index-document index.html --error-document index.html
   ```

3. **Upload the built files**:

   ```bash
   aws s3 sync dist/ s3://chainocracy-web/ --acl public-read
   ```

4. **Create a CloudFront distribution**:

   ```bash
   aws cloudfront create-distribution --origin-domain-name chainocracy-web.s3-website-us-east-1.amazonaws.com --default-root-object index.html
   ```

5. **Configure your custom domain in CloudFront and set up SSL**

### Server-Side Rendering

For improved SEO and performance, you can deploy the web frontend with server-side rendering using Next.js.

1. **Convert the React application to Next.js** (if not already using Next.js)
2. **Build the application**:

   ```bash
   cd web-frontend
   npm install
   npm run build
   ```

3. **Start the Next.js server**:

   ```bash
   npm start
   ```

4. **Use PM2 for process management**:

   ```bash
   pm2 start npm --name "chainocracy-web" -- start
   pm2 startup
   pm2 save
   ```

5. **Set up Nginx as a reverse proxy** (similar to the backend deployment)

## Mobile Frontend Deployment

### App Store Submission

1. **Configure app.json for Expo**:

   ```json
   {
     "expo": {
       "name": "Chainocracy Voter",
       "slug": "chainocracy-voter",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "updates": {
         "fallbackToCacheTimeout": 0
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "ios": {
         "supportsTablet": true,
         "bundleIdentifier": "com.chainocracy.voter",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

2. **Build the iOS app**:

   ```bash
   cd mobile-frontend
   eas build -p ios
   ```

3. **Submit to App Store**:

   ```bash
   eas submit -p ios
   ```

### Google Play Store Submission

1. **Configure app.json for Expo**:

   ```json
   {
     "expo": {
       "name": "Chainocracy Voter",
       "slug": "chainocracy-voter",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "updates": {
         "fallbackToCacheTimeout": 0
       },
       "assetBundlePatterns": [
         "**/*"
       ],
       "android": {
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#FFFFFF"
         },
         "package": "com.chainocracy.voter",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build the Android app**:

   ```bash
   cd mobile-frontend
   eas build -p android
   ```

3. **Submit to Google Play**:

   ```bash
   eas submit -p android
   ```

### Enterprise Distribution

For enterprise distribution without using app stores:

#### iOS Enterprise Distribution

1. **Obtain an Apple Enterprise Developer account**
2. **Configure app.json for enterprise distribution**:

   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.chainocracy",
         "buildNumber": "1.0.0",
         "supportsTablet": true,
         "config": {
           "usesNonExemptEncryption": false
         }
       }
     }
   }
   ```

3. **Build the app with enterprise profile**:

   ```bash
   eas build --profile enterprise --platform ios
   ```

4. **Distribute the IPA file through your enterprise distribution system**

#### Android Enterprise Distribution

1. **Configure app.json for enterprise distribution**:

   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.chainocracy",
         "versionCode": 1
       }
     }
   }
   ```

2. **Build the app**:

   ```bash
   eas build --profile enterprise --platform android
   ```

3. **Distribute the APK file through your enterprise distribution system**

## Database Setup

The Chainocracy system uses LevelDB for blockchain data storage. This is embedded in the application and doesn't require a separate database server. However, you should configure proper data persistence:

### Data Directory Configuration

1. **Create a dedicated data directory**:

   ```bash
   sudo mkdir -p /var/chainocracy/data
   sudo chown -R $USER:$USER /var/chainocracy
   ```

2. **Configure the application to use this directory**:

   In your `.env` file:
   ```
   DATABASE_PATH=/var/chainocracy/data/blockchain
   ```

### Backup Strategy

1. **Create a backup script**:

   ```bash
   nano /opt/chainocracy/backup.sh
   ```

   Add the following content:

   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d%H%M%S")
   BACKUP_DIR=/var/backups/chainocracy
   mkdir -p $BACKUP_DIR
   
   # Stop the application temporarily
   pm2 stop chainocracy-backend
   
   # Create a backup
   tar -czf $BACKUP_DIR/blockchain-$TIMESTAMP.tar.gz /var/chainocracy/data
   
   # Restart the application
   pm2 start chainocracy-backend
   
   # Remove backups older than 30 days
   find $BACKUP_DIR -name "blockchain-*.tar.gz" -mtime +30 -delete
   ```

2. **Make the script executable**:

   ```bash
   chmod +x /opt/chainocracy/backup.sh
   ```

3. **Schedule regular backups with cron**:

   ```bash
   crontab -e
   ```

   Add the following line to run the backup daily at 2 AM:
   ```
   0 2 * * * /opt/chainocracy/backup.sh
   ```

## Blockchain Node Configuration

### Single Node Setup

For a basic deployment, a single blockchain node is sufficient:

1. **Configure the node in the `.env` file**:

   ```
   BLOCKCHAIN_NODE_ADDRESS=http://localhost:3010
   IS_MAIN_NODE=true
   ```

### Multiple Node Setup

For a production environment, multiple blockchain nodes are recommended:

1. **Set up the main node**:

   ```
   BLOCKCHAIN_NODE_ADDRESS=http://main-node.chainocracy.com
   IS_MAIN_NODE=true
   NODE_PEERS=http://node2.chainocracy.com,http://node3.chainocracy.com
   ```

2. **Set up secondary nodes**:

   ```
   BLOCKCHAIN_NODE_ADDRESS=http://node2.chainocracy.com
   IS_MAIN_NODE=false
   MAIN_NODE_ADDRESS=http://main-node.chainocracy.com
   NODE_PEERS=http://main-node.chainocracy.com,http://node3.chainocracy.com
   ```

3. **Configure node synchronization**:

   The nodes will automatically synchronize the blockchain. You can verify this by checking the logs:

   ```bash
   pm2 logs chainocracy-backend
   ```

## Security Considerations

### Network Security

1. **Configure a firewall**:

   ```bash
   # Allow SSH, HTTP, and HTTPS
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   
   # Enable the firewall
   sudo ufw enable
   ```

2. **Set up a Web Application Firewall (WAF)**:

   ```bash
   sudo apt install -y libapache2-mod-security2
   sudo a2enmod security2
   sudo systemctl restart apache2
   ```

### Application Security

1. **Secure environment variables**:

   - Use a `.env` file that is not committed to version control
   - Set restrictive permissions: `chmod 600 .env`

2. **Implement rate limiting**:

   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again after 15 minutes'
   });
   
   app.use('/api/', apiLimiter);
   ```

3. **Set security headers with Helmet**:

   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

### SSL/TLS Configuration

1. **Generate strong Diffie-Hellman parameters**:

   ```bash
   sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
   ```

2. **Configure Nginx with strong SSL settings**:

   ```nginx
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_prefer_server_ciphers on;
   ssl_dhparam /etc/nginx/dhparam.pem;
   ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
   ssl_ecdh_curve secp384r1;
   ssl_session_timeout 10m;
   ssl_session_cache shared:SSL:10m;
   ssl_session_tickets off;
   ssl_stapling on;
   ssl_stapling_verify on;
   resolver 8.8.8.8 8.8.4.4 valid=300s;
   resolver_timeout 5s;
   add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
   add_header X-Frame-Options DENY;
   add_header X-Content-Type-Options nosniff;
   add_header X-XSS-Protection "1; mode=block";
   ```

## Monitoring and Maintenance

### System Monitoring

1. **Install and configure Prometheus**:

   ```bash
   # Download Prometheus
   wget https://github.com/prometheus/prometheus/releases/download/v2.37.0/prometheus-2.37.0.linux-amd64.tar.gz
   tar xvfz prometheus-2.37.0.linux-amd64.tar.gz
   cd prometheus-2.37.0.linux-amd64
   
   # Configure Prometheus
   nano prometheus.yml
   ```

   Add the following configuration:

   ```yaml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'prometheus'
       static_configs:
         - targets: ['localhost:9090']
     
     - job_name: 'node'
       static_configs:
         - targets: ['localhost:9100']
     
     - job_name: 'chainocracy-backend'
       static_configs:
         - targets: ['localhost:3010']
   ```

2. **Install and configure Grafana**:

   ```bash
   # Add Grafana APT repository
   sudo apt-get install -y apt-transport-https software-properties-common
   sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
   wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
   
   # Install Grafana
   sudo apt-get update
   sudo apt-get install -y grafana
   
   # Start Grafana
   sudo systemctl enable grafana-server
   sudo systemctl start grafana-server
   ```

3. **Set up Node Exporter for system metrics**:

   ```bash
   # Download Node Exporter
   wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
   tar xvfz node_exporter-1.3.1.linux-amd64.tar.gz
   cd node_exporter-1.3.1.linux-amd64
   
   # Start Node Exporter
   ./node_exporter &
   ```

### Application Monitoring

1. **Implement health check endpoints**:

   ```javascript
   app.get('/health', (req, res) => {
     res.status(200).json({ status: 'UP' });
   });
   
   app.get('/health/detailed', (req, res) => {
     // Check database connection, blockchain status, etc.
     const dbStatus = checkDatabaseConnection();
     const blockchainStatus = checkBlockchainStatus();
     
     res.status(200).json({
       status: dbStatus && blockchainStatus ? 'UP' : 'DOWN',
       components: {
         database: { status: dbStatus ? 'UP' : 'DOWN' },
         blockchain: { status: blockchainStatus ? 'UP' : 'DOWN' }
       }
     });
   });
   ```

2. **Set up application logging**:

   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     defaultMeta: { service: 'chainocracy-backend' },
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   
   if (process.env.NODE_ENV !== 'production') {
     logger.add(new winston.transports.Console({
       format: winston.format.simple()
     }));
   }
   ```

3. **Configure log rotation**:

   ```bash
   sudo apt install -y logrotate
   sudo nano /etc/logrotate.d/chainocracy
   ```

   Add the following configuration:

   ```
   /opt/chainocracy/backend/logs/*.log {
     daily
     missingok
     rotate 14
     compress
     delaycompress
     notifempty
     create 0640 ubuntu ubuntu
     sharedscripts
     postrotate
       pm2 reload chainocracy-backend
     endscript
   }
   ```

## Backup and Recovery

### Automated Backups

1. **Set up AWS S3 backups**:

   ```bash
   # Install AWS CLI
   sudo apt install -y awscli
   
   # Configure AWS credentials
   aws configure
   
   # Create backup script
   nano /opt/chainocracy/s3-backup.sh
   ```

   Add the following content:

   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d%H%M%S")
   BACKUP_DIR=/var/backups/chainocracy
   S3_BUCKET=s3://chainocracy-backups
   
   # Create local backup
   /opt/chainocracy/backup.sh
   
   # Upload to S3
   aws s3 cp $BACKUP_DIR/blockchain-$TIMESTAMP.tar.gz $S3_BUCKET/
   ```

2. **Schedule S3 backups**:

   ```bash
   crontab -e
   ```

   Add the following line:
   ```
   0 3 * * * /opt/chainocracy/s3-backup.sh
   ```

### Disaster Recovery

1. **Create a recovery script**:

   ```bash
   nano /opt/chainocracy/recover.sh
   ```

   Add the following content:

   ```bash
   #!/bin/bash
   
   if [ $# -ne 1 ]; then
     echo "Usage: $0 <backup-file>"
     exit 1
   fi
   
   BACKUP_FILE=$1
   
   # Stop the application
   pm2 stop chainocracy-backend
   
   # Backup current data
   TIMESTAMP=$(date +"%Y%m%d%H%M%S")
   tar -czf /var/backups/chainocracy/pre-recovery-$TIMESTAMP.tar.gz /var/chainocracy/data
   
   # Remove current data
   rm -rf /var/chainocracy/data/*
   
   # Restore from backup
   tar -xzf $BACKUP_FILE -C /
   
   # Restart the application
   pm2 start chainocracy-backend
   
   echo "Recovery completed successfully"
   ```

2. **Make the script executable**:

   ```bash
   chmod +x /opt/chainocracy/recover.sh
   ```

3. **Test the recovery process**:

   ```bash
   /opt/chainocracy/recover.sh /var/backups/chainocracy/blockchain-20230101000000.tar.gz
   ```

## Scaling Strategies

### Horizontal Scaling

1. **Set up a load balancer**:

   ```bash
   # Install HAProxy
   sudo apt install -y haproxy
   
   # Configure HAProxy
   sudo nano /etc/haproxy/haproxy.cfg
   ```

   Add the following configuration:

   ```
   frontend http_front
     bind *:80
     stats uri /haproxy?stats
     default_backend http_back
   
   backend http_back
     balance roundrobin
     server backend1 backend1.chainocracy.com:3010 check
     server backend2 backend2.chainocracy.com:3010 check
   ```

2. **Configure session persistence**:

   ```
   backend http_back
     balance roundrobin
     cookie SERVERID insert indirect nocache
     server backend1 backend1.chainocracy.com:3010 check cookie backend1
     server backend2 backend2.chainocracy.com:3010 check cookie backend2
   ```

### Vertical Scaling

1. **Increase server resources**:

   - Upgrade CPU, RAM, and disk space as needed
   - Monitor resource usage to determine when scaling is necessary

2. **Optimize application performance**:

   - Implement caching
   - Optimize database queries
   - Use worker threads for CPU-intensive tasks

## Troubleshooting

### Common Issues

1. **Application won't start**:

   - Check logs: `pm2 logs chainocracy-backend`
   - Verify environment variables
   - Check for port conflicts: `sudo netstat -tulpn | grep 3010`

2. **Database errors**:

   - Check database directory permissions
   - Verify database path in configuration
   - Check disk space: `df -h`

3. **Blockchain synchronization issues**:

   - Check network connectivity between nodes
   - Verify node configuration
   - Check for firewall rules blocking communication

### Debugging Production Issues

1. **Enable debug logging temporarily**:

   ```bash
   # Update environment variables
   pm2 stop chainocracy-backend
   export DEBUG=chainocracy:*
   pm2 start chainocracy-backend
   ```

2. **Analyze application logs**:

   ```bash
   # View real-time logs
   pm2 logs chainocracy-backend
   
   # Search for specific errors
   grep "Error" /opt/chainocracy/backend/logs/combined.log
   ```

3. **Check system resources**:

   ```bash
   # CPU and memory usage
   top
   
   # Disk usage
   df -h
   
   # I/O statistics
   iostat
   ```

### Support Resources

- **Documentation**: Refer to the project documentation
- **GitHub Issues**: Check for known issues and solutions
- **Community Forum**: Post questions on the community forum
- **Professional Support**: Contact the Chainocracy team for professional support
