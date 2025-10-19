# Quick Start Guide

Get the Baseball Exit Velocity Analyzer running in 3 simple steps.

## Prerequisites

- Docker and Docker Compose installed
- That's it!

## Setup (2 minutes)

### 1. Create Configuration File

```bash
cp .env.example .env
```

### 2. Generate Session Secret

```bash
openssl rand -base64 32
```

Copy the output and paste it into `.env` as the `SESSION_SECRET` value:

```
SESSION_SECRET=<paste-the-output-here>
```

### 3. Start the Application

```bash
docker compose up -d
```

## Access

Open your browser: **http://localhost:6923**

## That's It!

The app is now running **without authentication** (OAuth disabled).

- Upload videos and analyze exit velocities
- All features work except saving analyses
- No login required

## Want to Save Analyses?

Follow the [OAUTH_SETUP.md](./OAUTH_SETUP.md) guide to enable Google login (~15 minutes).

Once OAuth is configured:
- Users can log in with Google
- Save analysis history
- View statistics
- Track progress over time

## Common Commands

```bash
# View logs
docker compose logs -f

# Stop application
docker compose down

# Restart application
docker compose down && docker compose up -d

# Rebuild after code changes
docker compose up --build -d
```

## Change Port

Want to use a different port?

1. Edit `.env`:
   ```
   PORT=8080
   ```

2. Restart:
   ```bash
   docker compose down && docker compose up -d
   ```

3. Access at new port:
   ```
   http://localhost:8080
   ```

## Your .env Should Look Like This

```
PORT=6923
NODE_ENV=production
SESSION_SECRET=<your-generated-secret>
```

Add these lines ONLY if you want OAuth:
```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

## Need Help?

- Full docs: [README.md](./README.md)
- Production setup: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- OAuth setup: [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- Check logs: `docker compose logs -f`

## Troubleshooting

**Port already in use?**
Change `PORT` in `.env` and restart.

**Can't generate session secret?**
Use this instead:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Want to reset everything?**
```bash
docker compose down
rm -rf ./data
rm .env
```

Then start over from step 1.

---

**Ready to analyze?** Go to `http://localhost:6923` and upload a video!
