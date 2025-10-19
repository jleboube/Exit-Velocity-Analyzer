# OAuth Troubleshooting Guide

If you're getting a 404 error after clicking "Sign in with Google", follow these steps:

## Quick Fix Checklist

### 1. Verify Your Callback URL

The callback URL **MUST** match exactly in three places:

**A. In your `.env` file:**
```bash
GOOGLE_CALLBACK_URL=http://localhost:6923/auth/google/callback
```

**B. In Google Cloud Console:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Select your project
- Go to **APIs & Services** > **Credentials**
- Click on your OAuth 2.0 Client ID
- Under **Authorized redirect URIs**, you should see:
  ```
  http://localhost:6923/auth/google/callback
  ```

**C. Verify it matches your PORT:**
- If your `PORT=6923` in `.env`, callback should be `http://localhost:6923/auth/google/callback`
- If you changed PORT to something else, update the callback URL everywhere

### 2. Check Docker Container Logs

```bash
docker compose logs -f
```

Look for these messages:
- ✓ Should see: `✓ Google OAuth is enabled`
- ✓ Should see: `Callback URL: http://localhost:6923/auth/google/callback`
- ✓ After login attempt, should see: `GET /auth/google/callback`
- ❌ If you see: `404 Not Found` - the route isn't being hit

### 3. Test the Auth Route

Open your browser and go to:
```
http://localhost:6923/auth/test
```

You should see:
```json
{
  "message": "Auth routes are working",
  "oauthEnabled": true,
  "authenticated": false
}
```

If you get a 404 here, the server isn't routing properly.

### 4. Rebuild the Container

After making changes:

```bash
# Stop and remove containers
docker compose down

# Rebuild and start
docker compose up --build -d

# Watch logs
docker compose logs -f
```

## Common Issues

### Issue: "404 Not Found - nginx"

**Cause:** The nginx error message is misleading. This usually means Google is redirecting to the wrong URL.

**Solution:**
1. Check your `.env` file - make sure `GOOGLE_CALLBACK_URL` is set correctly
2. Check Google Cloud Console - verify the callback URL matches
3. The URL must include the port number: `http://localhost:6923/auth/google/callback`

### Issue: Callback URL Mismatch

**Error in browser:** `redirect_uri_mismatch`

**Solution:**
```bash
# Check what callback URL the app is using
docker compose logs | grep "Callback URL"

# Should show:
# Callback URL: http://localhost:6923/auth/google/callback
```

Then verify this EXACT URL is in Google Cloud Console:
1. Go to Credentials
2. Click your OAuth Client ID
3. Check "Authorized redirect URIs"
4. Add the URL if it's missing (include port!)
5. Click "Save"
6. Wait 5 minutes for changes to propagate

### Issue: Port Mismatch

**Symptoms:** OAuth initiates but callback fails with 404

**Solution:**
```bash
# In .env, make sure PORT matches callback URL
PORT=6923
GOOGLE_CALLBACK_URL=http://localhost:6923/auth/google/callback

# If you change PORT to 8080:
PORT=8080
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# Then update Google Cloud Console with the new callback URL
```

### Issue: Container Not Running on Expected Port

**Check:**
```bash
docker compose ps
```

Should show:
```
NAME                           STATUS    PORTS
exit-velocity-analyzer-app     Up        0.0.0.0:6923->6923/tcp
```

If port mapping is wrong, check your `.env` file and rebuild.

## Step-by-Step OAuth Flow

1. **User clicks "Sign in with Google"**
   - Browser goes to: `/auth/google`
   - Server redirects to: `https://accounts.google.com/...`

2. **User selects Google account**
   - Google redirects back to: `http://localhost:6923/auth/google/callback?code=...`
   - This is where 404 happens if callback URL is wrong

3. **Server processes callback**
   - Route `/auth/google/callback` should be handled by `routes/auth.js`
   - Passport exchanges code for user info
   - User is logged in
   - Redirects to: `/?login=success`

## Debugging Commands

```bash
# Check if server is running
docker compose ps

# View all logs
docker compose logs

# View logs in real-time
docker compose logs -f

# Check environment variables in container
docker compose exec web env | grep GOOGLE

# Restart container
docker compose restart

# Full rebuild
docker compose down
docker compose up --build -d
```

## Verify Your .env File

Your `.env` should look like this:

```bash
# Server Configuration
PORT=6923
NODE_ENV=production
SESSION_SECRET=<your-generated-secret>

# Google OAuth
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:6923/auth/google/callback

# Database
DATABASE_PATH=./data/analytics.db
```

**Critical points:**
- `PORT` matches the port in `GOOGLE_CALLBACK_URL`
- `GOOGLE_CLIENT_ID` ends with `.apps.googleusercontent.com`
- `GOOGLE_CLIENT_SECRET` starts with `GOCSPX-`
- `GOOGLE_CALLBACK_URL` includes the port and `/auth/google/callback` path

## Still Not Working?

1. **Delete and recreate OAuth credentials:**
   - Sometimes Google Cloud credentials get corrupted
   - Create a new OAuth 2.0 Client ID
   - Update your `.env` with new credentials

2. **Check Google Cloud Console app status:**
   - Make sure your OAuth consent screen is configured
   - Add yourself as a test user if app is in testing mode

3. **Clear browser cookies:**
   - Sometimes old session cookies cause issues
   - Clear cookies for `localhost`

4. **Check firewall:**
   - Make sure port 6923 isn't blocked
   - Try accessing `http://localhost:6923` directly

5. **Use incognito/private mode:**
   - Eliminates browser cache/cookie issues
   - Try the OAuth flow in a private window

## Success Indicators

When OAuth is working correctly, you'll see:

**In logs:**
```
✓ Google OAuth is enabled
Callback URL: http://localhost:6923/auth/google/callback
🚀 Server running on http://localhost:6923
GET /auth/google
GET /auth/google/callback
✓ OAuth callback successful for user: yourname@gmail.com
```

**In browser:**
- Redirects to `/?login=success`
- "Sign in with Google" button becomes user profile
- Can see "My Analyses" link
- Can save analyses

## Need More Help?

If you're still having issues:

1. **Share your logs:**
   ```bash
   docker compose logs > oauth-logs.txt
   ```

2. **Check these exact values:**
   - What's in your `.env` `GOOGLE_CALLBACK_URL`?
   - What's in Google Cloud Console redirect URIs?
   - What port is the app actually running on?
   - What URL does the 404 happen on?

3. **Test without Docker:**
   ```bash
   npm install
   npm start
   # Then try OAuth again
   ```
