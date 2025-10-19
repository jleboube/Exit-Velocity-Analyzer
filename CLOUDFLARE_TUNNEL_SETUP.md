# Cloudflare Tunnel Setup Guide

This guide covers setting up Google OAuth when using Cloudflare Tunnels to expose your application.

## Prerequisites

- Cloudflare Tunnel already configured and running
- Your app accessible via a public URL (e.g., `https://baseball.yourdomain.com`)
- Docker and Docker Compose installed

## Step 1: Update Your .env File

Edit your `.env` file with your Cloudflare Tunnel URL:

```bash
# Server Configuration
PORT=6923
NODE_ENV=production
SESSION_SECRET=<your-generated-secret>

# Public URL Configuration
# IMPORTANT: Use your Cloudflare Tunnel URL here
PUBLIC_URL=https://baseball.yourdomain.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-secret>
# Use your PUBLIC URL for the callback, NOT localhost
GOOGLE_CALLBACK_URL=https://baseball.yourdomain.com/auth/google/callback

# Database
DATABASE_PATH=./data/analytics.db
```

**Critical Points:**
- `PUBLIC_URL` must be your **public** Cloudflare Tunnel URL
- `GOOGLE_CALLBACK_URL` must use the **same** public URL
- Both must use `https://` (Cloudflare provides SSL)
- Do NOT use `localhost` or `127.0.0.1`

## Step 2: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID (or create a new one)

### Add Authorized JavaScript Origins

Add your Cloudflare Tunnel URL:
```
https://baseball.yourdomain.com
```

### Add Authorized Redirect URIs

Add your callback URL:
```
https://baseball.yourdomain.com/auth/google/callback
```

**Important:**
- Use `https://` (not `http://`)
- Include your exact domain/subdomain
- Path must be `/auth/google/callback`
- No trailing slash

5. Click **Save**
6. Wait 5-10 minutes for changes to propagate

## Step 3: Configure Cloudflare Tunnel

Make sure your Cloudflare Tunnel is configured to route traffic to your container.

### Example Cloudflare Tunnel Config

If using `cloudflared`:

```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: baseball.yourdomain.com
    service: http://localhost:6923
  - service: http_status:404
```

### Using Cloudflare Dashboard

1. Go to **Zero Trust** > **Access** > **Tunnels**
2. Select your tunnel
3. Add a public hostname:
   - **Subdomain**: `baseball` (or whatever you chose)
   - **Domain**: `yourdomain.com`
   - **Service**: `HTTP://localhost:6923`

## Step 4: Rebuild and Start

```bash
# Stop existing container
docker compose down

# Rebuild with new configuration
docker compose up --build -d

# Watch logs
docker compose logs -f
```

## Step 5: Verify Configuration

### Check Logs

You should see:
```
✓ Google OAuth is enabled
Public URL: https://baseball.yourdomain.com
Callback URL: https://baseball.yourdomain.com/auth/google/callback
🚀 Server running on http://localhost:6923
```

### Test the App

1. Visit your public URL: `https://baseball.yourdomain.com`
2. You should see the app load
3. Click "Sign in with Google"
4. You should be redirected to Google
5. After selecting your account, you should be redirected back to your app
6. You should see your profile and "My Analyses" link

### Test Auth Routes

Visit: `https://baseball.yourdomain.com/auth/test`

Should return:
```json
{
  "message": "Auth routes are working",
  "oauthEnabled": true,
  "authenticated": false
}
```

## Common Issues with Cloudflare Tunnels

### Issue: "redirect_uri_mismatch" Error

**Cause:** Callback URL doesn't match Google Cloud Console

**Solution:**
1. Check your `.env`: `GOOGLE_CALLBACK_URL=https://baseball.yourdomain.com/auth/google/callback`
2. Check Google Cloud Console: Should have **exact same URL**
3. Make sure you're using `https://` in both places
4. Wait 5-10 minutes after changing Google Cloud Console settings

### Issue: Session/Cookie Issues

**Symptoms:**
- Login succeeds but immediately logged out
- Can't stay authenticated
- "Not logged in" after successful OAuth

**Solution:**
The app is now configured to handle this automatically:
- Cookies use `SameSite=none` with HTTPS
- `secure` flag is set when using HTTPS
- Proxy trust is enabled

If still having issues, check:
1. Your browser allows third-party cookies
2. No browser extensions blocking cookies
3. Try in incognito/private mode

### Issue: 404 After OAuth Callback

**Cause:** Cloudflare isn't routing the callback correctly

**Solution:**
1. Make sure Cloudflare Tunnel is routing to port 6923
2. Check container logs: `docker compose logs -f`
3. You should see: `GET /auth/google/callback`
4. If not, Cloudflare isn't forwarding requests

### Issue: Mixed Content Warnings

**Cause:** App trying to load HTTP resources on HTTPS page

**Solution:**
- Cloudflare provides SSL automatically
- Make sure `PUBLIC_URL` uses `https://`
- The app will auto-detect and use secure settings

## Environment Variable Summary

For Cloudflare Tunnels, your `.env` should look like this:

```bash
# Use your actual values here
PORT=6923
NODE_ENV=production
SESSION_SECRET=<generate with: openssl rand -base64 32>

# Your Cloudflare Tunnel URL
PUBLIC_URL=https://baseball.yourdomain.com

# Google OAuth - use your tunnel URL for callback
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://baseball.yourdomain.com/auth/google/callback

DATABASE_PATH=./data/analytics.db
```

## Security Considerations

### Session Security
- Sessions are stored in SQLite (persistent)
- Cookies are `httpOnly` (not accessible via JavaScript)
- Cookies are `secure` when using HTTPS
- Sessions expire after 24 hours

### Cloudflare Benefits
- Automatic SSL/TLS
- DDoS protection
- Rate limiting (can be configured)
- Access controls (can be configured)

### Recommendations
1. **Enable Cloudflare Access** for additional authentication layer
2. **Set up rate limiting** to prevent abuse
3. **Monitor logs** for suspicious activity
4. **Use strong SESSION_SECRET** (minimum 32 characters)
5. **Regularly update** dependencies

## Testing Your Setup

### 1. Test Basic Access
```bash
curl https://baseball.yourdomain.com
# Should return HTML
```

### 2. Test Auth Routes
```bash
curl https://baseball.yourdomain.com/auth/test
# Should return JSON with "Auth routes are working"
```

### 3. Test OAuth Flow
1. Open browser to `https://baseball.yourdomain.com`
2. Click "Sign in with Google"
3. Check browser network tab for redirects
4. Should see: your-domain → Google → your-domain/auth/google/callback → your-domain/?login=success

### 4. Check Logs
```bash
docker compose logs -f
```

After successful login, should see:
```
GET /auth/google
GET /auth/google/callback
✓ OAuth callback successful for user: yourname@gmail.com
GET /?login=success
```

## Troubleshooting Commands

```bash
# Check environment variables
docker compose exec web env | grep PUBLIC_URL
docker compose exec web env | grep GOOGLE_CALLBACK_URL

# Restart container
docker compose restart

# Full rebuild
docker compose down
docker compose up --build -d

# View logs in real-time
docker compose logs -f web

# Test from inside container
docker compose exec web curl http://localhost:6923/auth/test
```

## Multiple Domains

If you want to use multiple domains (e.g., production and staging):

1. **Add all domains to Google Cloud Console:**
   ```
   https://baseball.yourdomain.com/auth/google/callback
   https://staging-baseball.yourdomain.com/auth/google/callback
   ```

2. **Use environment-specific .env files:**
   ```bash
   # .env.production
   PUBLIC_URL=https://baseball.yourdomain.com
   GOOGLE_CALLBACK_URL=https://baseball.yourdomain.com/auth/google/callback

   # .env.staging
   PUBLIC_URL=https://staging-baseball.yourdomain.com
   GOOGLE_CALLBACK_URL=https://staging-baseball.yourdomain.com/auth/google/callback
   ```

3. **Specify which .env to use:**
   ```bash
   docker compose --env-file .env.production up -d
   ```

## Need Help?

If you're still having issues:

1. **Check the logs** - most issues show up there
2. **Verify callback URL** - must match exactly in 3 places:
   - Your `.env` file
   - Google Cloud Console
   - Should appear in startup logs
3. **Wait for Google** - changes can take 5-10 minutes to propagate
4. **Try incognito mode** - eliminates browser cache issues
5. **Check Cloudflare Tunnel** - make sure it's routing to port 6923

## Success Checklist

- [ ] Cloudflare Tunnel is running and accessible
- [ ] `.env` file has `PUBLIC_URL` set to Cloudflare URL
- [ ] `.env` file has `GOOGLE_CALLBACK_URL` set to Cloudflare URL with `/auth/google/callback`
- [ ] Google Cloud Console has callback URL added
- [ ] Google Cloud Console has JavaScript origin added
- [ ] Container rebuilt: `docker compose up --build -d`
- [ ] Logs show correct callback URL on startup
- [ ] Can access `https://yourdomain.com/auth/test`
- [ ] OAuth flow redirects to Google and back successfully
- [ ] Can see profile after login
- [ ] Can access "My Analyses" page
- [ ] Can save analyses
