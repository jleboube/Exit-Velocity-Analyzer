# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for the Baseball Exit Velocity Analyzer.

## Important Note

**Google OAuth is completely optional!** The application will run perfectly fine without it. If you don't configure OAuth:
- The application will start normally
- Users can still analyze videos
- Login/logout buttons won't appear
- Save functionality won't be available

## When to Set Up OAuth

Set up OAuth if you want to:
- Allow users to save their analysis history
- Track analyses over time
- View statistics across multiple analyses

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Enter a project name (e.g., "Exit Velocity Analyzer")
4. Click **Create**

## Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Baseball Exit Velocity Analyzer
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. On the **Scopes** page, click **Save and Continue** (no additional scopes needed)
6. On the **Test users** page, add your email as a test user
7. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Exit Velocity Analyzer
   - **Authorized JavaScript origins**:
     - `http://localhost:6923` (default port, or use your custom PORT from .env)
     - Add your production domain if deploying
   - **Authorized redirect URIs**:
     - `http://localhost:6923/auth/google/callback` (match your PORT from .env)
     - Add production callback URL if deploying
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

## Step 5: Configure Your Application

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate a secure session secret:
   ```bash
   # On macOS/Linux:
   openssl rand -base64 32

   # Or use Node.js:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. Edit `.env` and add your credentials:
   ```
   PORT=6923
   NODE_ENV=production
   SESSION_SECRET=<paste-your-generated-secret>

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_CALLBACK_URL=http://localhost:6923/auth/google/callback

   DATABASE_PATH=./data/analytics.db
   ```

4. **Important**: The callback URL port must match your `PORT` setting
   - If you use `PORT=8080`, set `GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback`
   - Make sure this URL is added to Google Cloud Console authorized redirect URIs

## Step 6: Run the Application

```bash
# Build and start
docker compose up -d

# View logs
docker compose logs -f
```

Visit `http://localhost:6923` (or whatever port you set in `.env`)

## Verification

If OAuth is configured correctly:
- You'll see a "Sign in with Google" button in the top right
- After logging in, you'll see your profile picture and name
- After calculating exit velocity, you'll see a "Save Analysis" button
- You can visit "My Analyses" to see your saved data

If OAuth is NOT configured:
- No login buttons will appear
- Application works normally for video analysis
- Server logs will show: "⚠ Google OAuth is not configured - running without authentication features"

## Production Deployment

When deploying to production:

1. Update your Google OAuth credentials with your production domain:
   - Add `https://yourdomain.com` to Authorized JavaScript origins
   - Add `https://yourdomain.com/auth/google/callback` to Authorized redirect URIs

2. Update your `.env`:
   ```
   NODE_ENV=production
   GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
   ```

3. **Important**: Publish your OAuth consent screen:
   - Go to **OAuth consent screen** in Google Cloud Console
   - Click **Publish App**
   - This removes the "This app isn't verified" warning

## Troubleshooting

### "This app isn't verified" warning

This is normal during development. To remove it:
- Add your email as a test user (Step 3)
- Or publish your app (see Production Deployment)

### "redirect_uri_mismatch" error

Check that your callback URL in `.env` exactly matches one of the authorized redirect URIs in Google Cloud Console.

### No login button appears

- Check server logs to verify OAuth is enabled
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart the server after modifying `.env`

### "Login failed" message

- Verify your credentials are correct
- Check that the redirect URI is authorized
- Look at server logs for specific error messages

## Security Notes

- **Never commit `.env` to git** - it's already in `.gitignore`
- Use a strong, random SESSION_SECRET in production
- Use HTTPS in production
- Consider adding email domain restrictions in OAuth consent screen for internal use

## Need Help?

Check the server logs for specific error messages:
```bash
# Local development
npm start

# Docker
docker compose logs -f
```

The application will tell you if OAuth is enabled or disabled when it starts.
