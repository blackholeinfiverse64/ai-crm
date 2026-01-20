# 🚀 Complete Supabase Setup Guide

This guide will walk you through creating a new Supabase project and configuring it for this application.

## Step 1: Create a New Supabase Project

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click **"Start your project"** or **"Sign in"** if you already have an account

2. **Sign Up / Sign In**
   - Create a free account (if you don't have one)
   - Supabase offers a generous free tier

3. **Create New Project**
   - Click **"New Project"** button
   - Fill in the details:
     - **Name**: `ai-crm-system` (or any name you prefer)
     - **Database Password**: Create a strong password (save this securely!)
     - **Region**: Choose the region closest to you
     - **Pricing Plan**: Select **Free** (perfect for development)
   - Click **"Create new project"**
   - ⏳ Wait 2-3 minutes for the project to be set up

## Step 2: Get Your Project Credentials

1. **Go to Project Settings**
   - In your project dashboard, click the **⚙️ Settings** icon (bottom left)
   - Click **API** in the left sidebar

2. **Copy Your Credentials**
   You'll need these two values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long JWT token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Save These Credentials**
   - You'll need them for the `.env` file

## Step 3: Set Up the Database

1. **Open SQL Editor**
   - In the left sidebar, click **SQL Editor**
   - Click **New Query**

2. **Run the Setup Script**
   - Open the file `frontend/supabase_setup.sql` in your project
   - Copy the **entire contents** of that file
   - Paste it into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - ✅ You should see "Success. No rows returned"

3. **Verify the Setup**
   - Click **Table Editor** in the left sidebar
   - You should see a `profiles` table
   - Check that it has these columns:
     - `id` (UUID)
     - `email` (text)
     - `first_name` (text)
     - `last_name` (text)
     - `company_name` (text)
     - `avatar_url` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

## Step 4: Configure Authentication

1. **Enable Email Authentication**
   - Go to **Authentication** → **Providers** in the left sidebar
   - Find **Email** provider
   - Toggle **Enable Email provider** to **ON**
   - Toggle **Confirm email** to **ON** (recommended for security)
   - Click **Save**

2. **Configure Site URL**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL**: `http://localhost:3000`
   - Click **Save**

3. **Add Redirect URLs**
   - Still in **URL Configuration**
   - Under **Redirect URLs**, click **Add URL** and add:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/verify-email`
     - `http://localhost:3000/auth/reset-password`
   - Click **Save**

## Step 5: Configure Your Frontend

1. **Create `.env` File**
   - In the `frontend` directory, create a file named `.env`
   - Add the following content (replace with YOUR values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

2. **Replace the Values**
   - `VITE_SUPABASE_URL`: Your Project URL from Step 2
   - `VITE_SUPABASE_ANON_KEY`: Your anon public key from Step 2

3. **Restart Frontend Server**
   - Stop your frontend server (Ctrl+C)
   - Start it again: `npm run dev`
   - The new environment variables will be loaded

## Step 6: Test Your Setup

1. **Open the Application**
   - Go to: http://localhost:3000
   - You should see the login page

2. **Create a Test Account**
   - Click **"Create account"** or go to `/auth/signup`
   - Fill in the form:
     - First Name: Test
     - Last Name: User
     - Email: your-email@example.com
     - Password: (must be at least 8 characters with uppercase, lowercase, number, and special character)
     - Confirm Password: (same as above)
   - Click **Create Account**

3. **Verify Email**
   - Check your email inbox
   - You should receive a verification email from Supabase
   - Click the verification link
   - You'll be redirected back to the login page

4. **Login**
   - Enter your email and password
   - Click **Sign In**
   - ✅ You should be logged in and see the dashboard!

5. **Verify in Supabase**
   - Go to Supabase Dashboard → **Authentication** → **Users**
   - You should see your new user account
   - Go to **Table Editor** → **profiles**
   - You should see your profile record

## ✅ Setup Complete!

Your Supabase project is now fully configured and ready to use!

## 🔧 Optional: OAuth Setup (Google/GitHub)

If you want to enable social login:

### Google OAuth

1. **Create Google OAuth App**
   - Go to: https://console.cloud.google.com/
   - Create a new project or select existing
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "AI CRM System"
   - Authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
   - Click **Create**
   - Copy **Client ID** and **Client Secret**

2. **Configure in Supabase**
   - Go to Supabase → **Authentication** → **Providers**
   - Find **Google** provider
   - Toggle **Enable Google provider** to **ON**
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

### GitHub OAuth

1. **Create GitHub OAuth App**
   - Go to: https://github.com/settings/developers
   - Click **New OAuth App**
   - Application name: "AI CRM System"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL:
     - `https://your-project-id.supabase.co/auth/v1/callback`
   - Click **Register application**
   - Copy **Client ID**
   - Click **Generate a new client secret**
   - Copy **Client Secret**

2. **Configure in Supabase**
   - Go to Supabase → **Authentication** → **Providers**
   - Find **GitHub** provider
   - Toggle **Enable GitHub provider** to **ON**
   - Paste **Client ID** and **Client Secret**
   - Click **Save**

## 🐛 Troubleshooting

### "Failed to fetch" error
- Check if your `.env` file has correct Supabase URL and key
- Make sure you restarted the frontend server after creating `.env`
- Verify your Supabase project is active (not paused)

### Email not received
- Check your spam folder
- Verify email provider is enabled in Supabase
- Check Supabase logs: **Authentication** → **Logs**
- For development, Supabase sends emails from their service

### Database errors
- Make sure you ran the `supabase_setup.sql` script
- Check that the `profiles` table exists in Table Editor
- Verify RLS policies are created (check in SQL Editor)

### Connection refused
- Make sure your Supabase project is not paused
- Check that you're using the correct Project URL
- Verify your internet connection

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Authentication Guide**: https://supabase.com/docs/guides/auth
- **SQL Editor Guide**: https://supabase.com/docs/guides/database/tables

---

**Need help?** Check the `frontend/QUICKSTART.md` for more detailed instructions.

