# 🚀 وفاء (Wafa) — Deployment Guide

This guide covers deploying the Wafa platform to production using:
- **Frontend** → Vercel (free, perfect for Next.js PWA)
- **Backend API + Worker** → Railway (supports WebSockets for Socket.IO)
- **Database** → MongoDB Atlas (free 512MB tier)
- **Redis** → Railway (for BullMQ job queues)
- **WhatsApp** → Meta for Developers (WhatsApp Business API)
- **Push Notifications** → FCM (via VAPID keys)

---

## 📋 Prerequisites

### 1. Install CLI tools
```bash
# Vercel CLI (for frontend deployment)
npm install -g vercel

# Railway CLI (for backend + worker deployment)
npm install -g @railway/cli

# Verify installation
vercel --version
railway --version
```

### 2. Create accounts
- [Vercel](https://vercel.com/signup) (free with GitHub)
- [Railway](https://railway.app/login) (free $5/month credit)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (free 512MB)
- [Meta for Developers](https://developers.facebook.com/) (for WhatsApp API — optional)

---

## 🗄️ Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free **M0** cluster
3. Under **Database Access**, create a user:
   - Username: `wafa_admin`
   - Password: `<generate a strong password>`
4. Under **Network Access**, add IP: `0.0.0.0/0` (allow from anywhere)
5. Click **Connect** → **Drivers** → copy connection string:
   ```
   mongodb+srv://wafa_admin:<password>@cluster0.xxxxx.mongodb.net/wafa?retryWrites=true&w=majority
   ```

---

## 🔑 Step 2: Generate Secrets

```bash
# JWT secrets (run 3 times for different secrets)
openssl rand -hex 32

# VAPID keys for push notifications
npx web-push generate-vapid-keys

# OTP salt
openssl rand -hex 16
```

Save all generated values — you'll need them in Step 4.

---

## 🚂 Step 3: Deploy Backend + Worker to Railway

### 3.1 Create Railway project
```bash
# Login to Railway
railway login

# Create a new project
railway init
# Choose "Empty Project"
# Name it: wafa
```

### 3.2 Add MongoDB + Redis to Railway
```bash
# Add MongoDB (or use Atlas from Step 1)
railway add --plugin mongodb

# Add Redis
railway add --plugin redis
```

> 💡 **Tip**: Using Railway's MongoDB plugin is easier for beginners. Using MongoDB Atlas gives you more control and a bigger free tier.

### 3.3 Deploy Backend API
```bash
cd backend

# Link to Railway project
railway link --project wafa --service api

# Set environment variables (see .env.example for full list)
railway variables set MONGO_URI=mongodb+srv://...
railway variables set REDIS_URL=redis://...
railway variables set JWT_ACCESS_SECRET=<from step 2>
railway variables set JWT_REFRESH_SECRET=<from step 2>
railway variables set COOKIE_SECRET=<from step 2>
railway variables set OTP_SALT=<from step 2>
railway variables set VAPID_PUBLIC_KEY=<from step 2>
railway variables set VAPID_PRIVATE_KEY=<from step 2>
railway variables set VAPID_SUBJECT=mailto:admin@wafa.app
railway variables set FRONTEND_URL=https://wafa.vercel.app
railway variables set NODE_ENV=production

# Deploy
railway up --detach

# Get your backend URL
railway domain
# Output: https://wafa-api-production.up.railway.app
```

### 3.4 Deploy Worker
```bash
cd ../worker

# Link to Railway project (same project, different service)
railway link --project wafa --service worker

# Set environment variables (same as backend + these)
railway variables set MONGO_URI=mongodb+srv://...
railway variables set REDIS_URL=redis://...
railway variables set BACKEND_API_URL=https://wafa-api-production.up.railway.app/api/v1

# Deploy
railway up --detach
```

### 3.5 Verify backend
```bash
# Test health endpoint
curl https://wafa-api-production.up.railway.app/api/v1/health
# Should return: {"success":true,"data":{"status":"UP",...}}
```

---

## ▲ Step 4: Deploy Frontend to Vercel

### 4.1 Deploy
```bash
cd frontend

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://wafa-api-production.up.railway.app/api/v1

vercel env add NEXT_PUBLIC_SOCKET_URL production
# Enter: https://wafa-api-production.up.railway.app

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4.2 Or connect via GitHub (recommended)
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. **New Project** → Import your GitHub repo
4. Set **Root Directory** to `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://wafa-api-production.up.railway.app/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://wafa-api-production.up.railway.app`
6. **Deploy**

---

## 💬 Step 5: Configure WhatsApp Business API (Optional)

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → type: **Business**
3. Add **WhatsApp** product
4. Copy:
   - Phone Number ID
   - Access Token
   - From Number
5. Set in Railway:
   ```bash
   railway variables set WHATSAPP_PHONE_NUMBER_ID=<from Meta>
   railway variables set WHATSAPP_ACCESS_TOKEN=<from Meta>
   railway variables set WHATSAPP_FROM_NUMBER=<from Meta>
   ```
6. Redeploy backend: `cd backend && railway up --detach`

---

## ☁️ Step 6: Configure AWS S3 + SNS (Optional — for image uploads + SMS)

### S3 (image uploads)
1. Create an S3 bucket in AWS Console
2. Create an IAM user with S3 access
3. Set in Railway:
   ```bash
   railway variables set AWS_ACCESS_KEY_ID=<key>
   railway variables set AWS_SECRET_ACCESS_KEY=<secret>
   railway variables set AWS_S3_BUCKET_NAME=wafa-uploads
   railway variables set AWS_REGION=us-east-1
   ```

### SNS (SMS fallback for OTP)
```bash
railway variables set AWS_SNS_SENDER_ID=WAFA
```

---

## 🌱 Step 7: Seed Production Database

```bash
# Run seed script against production DB
cd backend
MONGO_URI=mongodb+srv://... node ../scripts/seed.js --clean --verbose
```

---

## 📱 Step 8: Update PWA Settings

After deployment, update the frontend with your production URLs:

1. In `frontend/next.config.mjs`, update the API rewrite if needed
2. In `frontend/public/manifest.json`, verify `start_url` and `scope`
3. In `backend/.env`, set `FRONTEND_URL=https://your-app.vercel.app`

---

## 🔍 Step 9: Verify Everything Works

```bash
# 1. Health check
curl https://wafa-api-production.up.railway.app/api/v1/health

# 2. Frontend loads
# Open https://wafa.vercel.app in browser

# 3. Auth flow
# - Go to /auth
# - Enter phone number
# - Check backend logs for OTP (in dev mode)
# - Verify login

# 4. Push notifications
# - Login → Settings → Notifications → Test
# - Allow browser notifications
# - You should see a push notification

# 5. Real-time (Socket.IO)
# - Open dashboard in 2 tabs
# - Confirm a dose in one tab
# - The other tab should update automatically

# 6. WhatsApp (if configured)
# - Login as doctor
# - Go to /doctor → Weekly Report Preview
# - Verify WhatsApp message format
```

---

## 🔄 Continuous Deployment

### GitHub + Vercel (automatic)
1. Push to `main` branch
2. Vercel auto-deploys frontend

### GitHub + Railway (automatic)
1. Connect Railway service to GitHub repo
2. Railway auto-deploys on push to `main`

---

## 💰 Cost Estimates

| Service | Free Tier | Production |
|---------|-----------|------------|
| Vercel (Frontend) | ✅ Hobby (free) | $20/month (Pro) |
| Railway (Backend + Worker) | $5 credit/month | $5-20/month |
| MongoDB Atlas | 512MB (free) | $9/month (2GB) |
| Redis (Railway plugin) | Free with Railway | Included |
| WhatsApp API | 1000 messages/month free | $0.005/message |
| AWS S3 | 5GB free | ~$0.50/month |
| **Total (MVP)** | **$0/month** | **~$25/month** |

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
railway logs

# Common issues:
# - MONGO_URI is wrong → verify connection string
# - JWT secrets missing → set all 3 secrets
# - Port binding → Railway sets PORT automatically
```

### Frontend can't connect to backend
```bash
# Verify NEXT_PUBLIC_API_URL is set
vercel env ls

# Check CORS
# Backend allows all origins in dev, restrict in prod
```

### Socket.IO not working
```bash
# Verify NEXT_PUBLIC_SOCKET_URL is set
# Must point to Railway backend (not Vercel)
# Vercel doesn't support WebSockets
```

### Push notifications not arriving
```bash
# 1. Verify VAPID keys are set in backend
# 2. Generate keys:
npx web-push generate-vapid-keys

# 3. Set in Railway:
railway variables set VAPID_PUBLIC_KEY=<new key>
railway variables set VAPID_PRIVATE_KEY=<new key>

# 4. Redeploy backend
```

### Worker cron jobs not running
```bash
# Check worker logs
railway logs --service worker

# Verify MONGO_URI and REDIS_URL are set for worker
```

---

## 📞 Support

- **Vercel docs**: https://vercel.com/docs
- **Railway docs**: https://docs.railway.app
- **MongoDB Atlas docs**: https://docs.atlas.mongodb.com/
- **WhatsApp API docs**: https://developers.facebook.com/docs/whatsapp

---

> 💊 **وفاء** — Deployed and ready to help patients never miss a dose!
