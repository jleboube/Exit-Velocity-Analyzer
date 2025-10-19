# Baseball Exit Velocity Analyzer

A web-based tool for estimating baseball exit velocity from high-frame-rate swing videos. This application uses frame-by-frame analysis and spatial calibration to calculate the speed of the ball immediately after bat contact.

> **New User?** Start with [QUICKSTART.md](./QUICKSTART.md) for a 2-minute setup guide!

## Features

### Core Features
- **Video Upload & Playback**: Upload swing videos and navigate frame-by-frame
- **Spatial Calibration**: Set scale using home plate's known dimensions (17 inches)
- **Ball Tracking**: Mark ball position before and after bat contact
- **Exit Velocity Calculation**: Automatically compute ball speed in MPH
- **Interactive UI**: Step-by-step guided workflow with visual feedback
- **Responsive Design**: Works on desktop and mobile devices

### Optional Features (With Google OAuth)
- **User Authentication**: Sign in with Google
- **Save Analyses**: Store analysis metadata for each video
- **Analysis History**: View all your past analyses with statistics
- **Statistics Dashboard**: Track your average, max, and min velocities
- **Analysis Management**: Delete unwanted analyses

> **Note**: Google OAuth is **completely optional**. The application works perfectly without it - authentication features simply won't be displayed if not configured.

## How It Works

1. **Upload Video**: Select a high-frame-rate video of a baseball swing
2. **Calibrate Distance**: Click the left and right corners of home plate to establish scale
3. **Mark Ball Position**: Click the ball just before and just after bat impact
4. **Enter Video FPS**: Input your video's frames per second
5. **Calculate**: Get the estimated exit velocity in MPH
6. **Save** (Optional): If logged in, save your analysis for future reference

## Requirements

- Modern web browser with HTML5 video support
- High-frame-rate video (120fps+, 240fps recommended)
- Video should be filmed from a stable position beside the batter
- Clear view of home plate and ball during contact
- Node.js 18+ (for running the server)

## Getting Started

### Production Quick Start (Recommended)

**See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for a streamlined production setup guide.**

1. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Generate and set session secret** in `.env`:
   ```bash
   openssl rand -base64 32
   ```
   Then update `SESSION_SECRET` in `.env` with the generated value.

3. **Start the application**:
   ```bash
   docker compose up -d
   ```

4. **Access**: `http://localhost:6923`

The application runs **without authentication** by default. To enable Google OAuth, see [OAUTH_SETUP.md](./OAUTH_SETUP.md).

### Port Configuration

**The port is controlled by ONE variable in `.env`:**

```bash
PORT=6923
```

That's it! The `compose.yml` automatically uses this value. No need to edit multiple files.

To change the port, just update `PORT` in `.env` and restart:
```bash
docker compose down
docker compose up -d
```

### Docker Commands

```bash
# Start the application
docker compose up -d

# Stop the container
docker compose down

# Rebuild after changes
docker compose up --build -d

# View logs
docker compose logs -f
```

## Authentication Setup (Optional)

Google OAuth is **completely optional**. The application works perfectly without it.

### To run WITHOUT authentication:
Just start the application with the Quick Start above - no OAuth configuration needed!

### To ENABLE authentication:

1. **Follow the OAuth setup guide**: [OAUTH_SETUP.md](./OAUTH_SETUP.md) (~15 minutes)

2. **Add credentials to `.env`**:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

3. **Restart**: `docker compose down && docker compose up -d`

**Note**: The callback URL automatically matches your `PORT` setting from `.env`.

When OAuth is enabled:
- ✓ Login/logout buttons appear
- ✓ "Save Analysis" button after calculations
- ✓ "My Analyses" page to view history
- ✓ Server logs: "✓ Google OAuth is enabled"

When OAuth is NOT configured:
- ⚠ No authentication UI (normal behavior)
- ⚠ Server logs: "⚠ Google OAuth is not configured"

See **[OAUTH_SETUP.md](./OAUTH_SETUP.md)** for detailed setup instructions.

## Technology Stack

### Frontend
- **HTML5**: Semantic markup and video element
- **CSS**: Tailwind CSS for styling
- **JavaScript**: Vanilla JS for interactivity

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **Passport.js**: Authentication middleware
- **Better-SQLite3**: Database for storing analyses

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Video Guidelines

For best results:
- Use 240fps or higher frame rate
- Film from directly beside the batter at a perpendicular angle
- Use a tripod or stable surface
- Ensure good lighting
- Keep the camera focused on the hitting zone
- Make sure home plate is visible in at least one frame

## Accuracy Considerations

The exit velocity calculation is an **estimation** based on:
- Video frame rate
- Point selection accuracy
- Calibration precision
- Camera angle and perspective

Results may vary from actual measurements due to:
- Perspective distortion
- Ball trajectory relative to camera
- Frame-to-frame timing precision
- User point selection accuracy

## Project Structure

```
exit-velocity-analyzer/
├── public/                      # Static frontend files
│   ├── index.html              # Main application
│   ├── analyses.html           # Analysis history page
│   ├── privacy.html            # Privacy policy
│   ├── terms.html              # Terms and conditions
│   └── baseball-home-plate.jpg # Reference image
├── routes/                      # API routes
│   ├── auth.js                 # Authentication routes
│   └── api.js                  # Analysis API endpoints
├── database/                    # Database module
│   └── db.js                   # SQLite database interface
├── config/                      # Configuration
│   └── passport.js             # Passport OAuth strategy
├── scripts/                     # Utility scripts
│   └── init-db.js              # Database initialization
├── server.js                    # Main server file
├── package.json                 # Node.js dependencies
├── Dockerfile                   # Docker container config
├── compose.yml                  # Docker Compose config
├── .env.example                 # Environment template
├── QUICKSTART.md               # Quick start guide (start here!)
├── PRODUCTION_SETUP.md         # Production deployment guide
├── OAUTH_SETUP.md              # OAuth setup guide
└── README.md                    # Full documentation (this file)
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/logout` - Logout user
- `GET /auth/status` - Check authentication status

### Analyses
- `POST /api/analyses` - Save a new analysis
- `GET /api/analyses` - Get all analyses for authenticated user
- `GET /api/analyses/:id` - Get a specific analysis
- `DELETE /api/analyses/:id` - Delete an analysis

## Database Schema

### Users Table
- `id` - Primary key
- `google_id` - Google OAuth ID
- `email` - User email
- `name` - Display name
- `picture` - Profile picture URL
- `created_at` - Account creation timestamp
- `last_login` - Last login timestamp

### Analyses Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `video_filename` - Name of analyzed video
- `fps` - Video frame rate
- `exit_velocity` - Calculated velocity (MPH)
- `calibration_distance_pixels` - Calibration measurement
- `ball_distance_pixels` - Ball travel distance
- `cal_point1_x/y` - Calibration point 1 coordinates
- `cal_point2_x/y` - Calibration point 2 coordinates
- `ball_point1_x/y` - Ball position before impact
- `ball_point2_x/y` - Ball position after impact
- `notes` - Optional notes
- `created_at` - Analysis timestamp

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 6923 | Server port (used for both host and container) |
| `NODE_ENV` | No | production | Environment mode |
| `SESSION_SECRET` | Yes | - | Session encryption key (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | No* | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No* | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No* | Auto-set | OAuth callback (auto-set to `http://localhost:${PORT}/auth/google/callback`) |
| `DATABASE_PATH` | No | ./data/analytics.db | SQLite database path |

\* Required only if you want to enable authentication

**Note**: To change the port, just edit `PORT` in `.env` - no other files need to be modified.

## Deployment

### Docker Deployment (Recommended)

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for a streamlined production setup guide.

**Quick version**:

1. **Create .env**:
   ```bash
   cp .env.example .env
   ```

2. **Set SESSION_SECRET** in `.env`:
   ```bash
   # Generate secret
   openssl rand -base64 32
   # Add to .env
   ```

3. **Optional**: Add OAuth credentials to `.env` (see [OAUTH_SETUP.md](./OAUTH_SETUP.md))

4. **Start**:
   ```bash
   docker compose up -d
   ```

Access at `http://localhost:6923` (or your custom `PORT` from `.env`)

### Production Considerations

- Set `NODE_ENV=production`
- Use a strong `SESSION_SECRET`
- Enable HTTPS
- Update OAuth callback URLs for your domain
- Consider using a more robust database (PostgreSQL) for high traffic
- Set up proper logging and monitoring
- Configure CORS for your domain
- Implement rate limiting
- Regular database backups

## Troubleshooting

### Application won't start
- Check that your configured port (default 6923) is not in use
- Try a different port by changing `PORT` in `.env`
- Check server logs: `docker compose logs -f`

### OAuth not working
- Verify `.env` file has correct credentials
- Check that callback URL matches Google Cloud Console
- Ensure you've enabled Google+ API
- See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed troubleshooting

### Database errors
- Try reinitializing: `npm run init-db`
- Check file permissions on `./data` directory
- Verify `DATABASE_PATH` is writable

### Login button not showing
- This is normal if OAuth is not configured
- Check server logs - should say "OAuth is enabled" or "OAuth is not configured"
- If you want OAuth, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)

## License

This project is open source and available for educational and personal use.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

## Support

For questions or issues, please open an issue on the repository.

## Privacy & Security

- Videos are processed entirely in the browser - never uploaded to servers
- Only analysis metadata is stored in the database
- User authentication via Google OAuth
- Session data is encrypted
- See [privacy.html](./public/privacy.html) for full privacy policy

---

Built with ❤️ for baseball analytics enthusiasts
