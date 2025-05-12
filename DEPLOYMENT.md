
# Hackzilla Deployment Guide

This document provides instructions for deploying the Hackzilla application in a production environment.

## Prerequisites

- Node.js 16+ installed on your server
- Access to a MongoDB database (either cloud-hosted or self-hosted)
- Basic understanding of environment variables and web hosting

## Environment Variables

The following environment variables need to be set in your production environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/hackzilla` |
| `ADMIN_DEFAULT_PASSWORD` | Default password for admin user | `admin` |

## Deployment Steps

### Option 1: Deploy to a VPS or traditional server

1. Clone your repository to the server:
   ```bash
   git clone <your-repository-url>
   cd hackzilla
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Set up environment variables:
   ```bash
   export MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
   export ADMIN_DEFAULT_PASSWORD=your_secure_password
   ```

5. Serve the application using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "hackzilla" -- run start
   ```

6. Set up a reverse proxy with Nginx or Apache to serve your application.

### Option 2: Deploy to Vercel

1. Sign up for a [Vercel account](https://vercel.com/signup) if you don't have one.

2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy your application:
   ```bash
   vercel
   ```

5. Configure environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to the "Environment Variables" section
   - Add `MONGODB_URI` and `ADMIN_DEFAULT_PASSWORD` with appropriate values

### Option 3: Deploy to Railway

1. Sign up for [Railway](https://railway.app/)

2. Connect your GitHub repository

3. Add a MongoDB service from the Railway dashboard

4. Configure environment variables in the Railway dashboard:
   - `MONGODB_URI` (will be auto-populated if using Railway's MongoDB service)
   - `ADMIN_DEFAULT_PASSWORD`

5. Deploy your application

## MongoDB Atlas Setup (Recommended for Production)

1. Create a [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register)

2. Create a new cluster (the free tier is sufficient for small applications)

3. Set up database access:
   - Create a database user with appropriate permissions
   - Set a secure password

4. Configure network access:
   - Add your server's IP address or set to allow access from anywhere (0.0.0.0/0)

5. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string and replace `<password>` with your database user's password
   - Use this as your `MONGODB_URI` environment variable

## Post-Deployment Verification

1. Access your deployed application
2. Log in with the default admin credentials:
   - Username: `admin`
   - Password: your configured `ADMIN_DEFAULT_PASSWORD` or `admin` if not changed
3. Verify that teams can be created and managed
4. Change the default admin password immediately

## Troubleshooting

- **Connection Issues**: Ensure your MongoDB connection string is correct and the IP address is whitelisted in MongoDB Atlas
- **Authentication Issues**: Check if the default admin user was created successfully
- **Performance Issues**: Consider adding appropriate indexes to your MongoDB collections for heavily queried fields

## Backup Strategy

For production deployments, implement a regular backup strategy:

1. Use MongoDB Atlas automated backups (included in paid tiers)
2. Set up scheduled backups using `mongodump`
3. Store backups in a secure, separate location

## Monitoring

Consider setting up monitoring for your application:

1. MongoDB Atlas provides monitoring tools for your database
2. Use services like UptimeRobot to monitor your application's uptime
3. Implement logging with tools like Winston or Pino and send logs to a service like Logtail
