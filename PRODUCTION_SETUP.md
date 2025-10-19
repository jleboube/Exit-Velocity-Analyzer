# Production Setup Guide

Quick guide to get the Baseball Exit Velocity Analyzer running in production.

## Quick Start (Without OAuth)

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and set your session secret:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

   Then update `.env`:
   ```
   SESSION_SECRET=<paste-the-generated-secret-here>
   ```

3. **Start the application**:
   ```bash
   docker compose up -d
   ```

4. **Access the app**:
   ```
   http://localhost:6923
   ```

That's it! The app will run without authentication features.

## Port Configuration

**You only need to change the port in ONE place: `.env`**

Edit `.env`:
```
PORT=6923
```

The `compose.yml` file automatically reads this value, so you don't need to edit it.

### Available Ports

The default is `6923`, but you can use any port you want. Just change `PORT` in `.env`:

```
PORT=8080
PORT=5000
PORT=6923
```

The OAuth callback URL will automatically update to match your port.

## Adding Google OAuth (Optional)

If you want users to be able to save their analyses:

1. **Follow the OAuth setup guide**: See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed steps (takes ~15 minutes)

2. **Add credentials to `.env`**:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

3. **Restart the application**:
   ```bash
   docker compose down
   docker compose up -d
   ```

The callback URL is automatically set to `http://localhost:${PORT}/auth/google/callback` based on your PORT setting.

## Your .env File Should Look Like This

### Without OAuth (Minimal):
```
PORT=6923
NODE_ENV=production
SESSION_SECRET=your-generated-secret-here
```

### With OAuth (Full Features):
```
PORT=6923
NODE_ENV=production
SESSION_SECRET=your-generated-secret-here

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:6923/auth/google/callback
```

## Useful Commands

```bash
# Start the application
docker compose up -d

# Stop the application
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up --build -d

# Check if it's running
docker compose ps
```

## Accessing the Application

- Main app: `http://localhost:6923`
- My Analyses: `http://localhost:6923/analyses` (requires login if OAuth enabled)
- Privacy: `http://localhost:6923/privacy`
- Terms: `http://localhost:6923/terms`

## Data Persistence

Your analysis data is stored in `./data/analytics.db` on your host machine. This directory is automatically created and persisted outside the Docker container.

To backup your data, simply copy the `./data` directory.

## Security Notes

1. **Never commit `.env` to git** - it contains secrets
2. **Use a strong SESSION_SECRET** - generate with `openssl rand -base64 32`
3. If deploying publicly, consider:
   - Using HTTPS (set up reverse proxy with nginx/Caddy)
   - Updating OAuth callback URLs to your domain
   - Setting up firewall rules

## Troubleshooting

### Port already in use
Change `PORT` in `.env` to a different number and restart:
```bash
docker compose down
docker compose up -d
```

### Can't access the application
Check if it's running:
```bash
docker compose ps
docker compose logs -f
```

### OAuth not working
1. Verify credentials in `.env`
2. Check callback URL matches Google Cloud Console
3. See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for troubleshooting

### Database issues
The database is automatically created in `./data/`. If you need to reset it:
```bash
docker compose down
rm -rf ./data
docker compose up -d
```

## Default Credentials

There are no default credentials. The app works without login, or you can sign in with any Google account once OAuth is configured.

## Need Help?

- Check server logs: `docker compose logs -f`
- See [README.md](./README.md) for full documentation
- See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for OAuth setup
