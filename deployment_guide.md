# connection Deployment & Production Guide

This guide describes how to deploy the client and server components to production services like MongoDB Atlas, Vercel, and Render/Railway.

---

## 1. MongoDB Atlas Setup

To migrate from local development database instance (`localhost`) to MongoDB Atlas:
1. Log into your account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Shared Cluster.
3. Go to **Network Access** and click **Add IP Address**. Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel & Render serverless engines can fetch connections.
4. Go to **Database Access** and create an administrator user with read-write roles.
5. Click **Connect** → **Drivers** to fetch your Connection String. Replace credentials placeholder:
   ```
   mongodb+srv://adminUser:<password>@cluster0.abcde.mongodb.net/connectionDB?retryWrites=true&w=majority
   ```

---

## 2. Cloudinary Media Hosting

To support permanent profile image uploads instead of temporary local server uploads:
1. Register for an account on [Cloudinary](https://cloudinary.com).
2. Grab the following credentials from the Dashboard console:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Configure these inside the backend production environment.

---

## 3. Backend Deployment (Render or Railway)

### 3.1 Render Config
1. Create an account on [Render](https://render.com).
2. Go to **New** → **Web Service** and connect your repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Click **Advanced** and declare the following **Environment Variables**:
   - `PORT` = `10000` (or leave default, Render maps ports dynamically)
   - `NODE_ENV` = `production`
   - `MONGO_URI` = `mongodb+srv://...` (your MongoDB Atlas string)
   - `JWT_SECRET` = `someSuperLongSecretKeyAccess`
   - `JWT_REFRESH_SECRET` = `someSuperLongSecretKeyRefresh`
   - `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
5. Deploy the Web Service. Copy the Render assigned URL (e.g. `https://connection-backend.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

### 4.1 Configuration
1. Log into your dashboard on [Vercel](https://vercel.com).
2. Choose **Add New** → **Project** and link the repository.
3. Configure parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand the **Environment Variables** accordion and add:
   - `VITE_API_URL` = `https://connection-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://connection-backend.onrender.com`
5. Click **Deploy**. Vercel will build and serve your React application under highly cached global CDN networks!

---

## 5. Security & Cors Verification in Production

> [!WARNING]
> When moving to production, ensure that you set the `ALLOWED_ORIGINS` environment variable in your backend deployment settings (e.g. on Render) to include your final Vercel frontend URL:
> ```ini
> ALLOWED_ORIGINS=https://connection-dating-app.vercel.app,http://localhost:5173
> ```
> This prevents cross-origin requests from being blocked while allowing you to keep local dev environments functional.
>
> Additionally, the backend automatically transitions the refresh token HttpOnly cookie setup to `sameSite: 'none'` and `secure: true` when running in `production` mode. This is required because modern browsers block cross-site cookies if they aren't marked as secure and cross-origin.


---

## 6. Build Optimization Checks

Ensure you run build compilation locally to confirm everything packages without errors:
```bash
cd frontend
npm run build
```
This bundles standard chunk loaders and compiles HTML/JS assets under optimal performance standards!
