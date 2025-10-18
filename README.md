# Baseball Exit Velocity Analyzer

A web-based tool for estimating baseball exit velocity from high-frame-rate swing videos. This application uses frame-by-frame analysis and spatial calibration to calculate the speed of the ball immediately after bat contact.

## Features

- **Video Upload & Playback**: Upload swing videos and navigate frame-by-frame
- **Spatial Calibration**: Set scale using home plate's known dimensions (17 inches)
- **Ball Tracking**: Mark ball position before and after bat contact
- **Exit Velocity Calculation**: Automatically compute ball speed in MPH
- **Interactive UI**: Step-by-step guided workflow with visual feedback
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Upload Video**: Select a high-frame-rate video of a baseball swing
2. **Calibrate Distance**: Click the left and right corners of home plate to establish scale
3. **Mark Ball Position**: Click the ball just before and just after bat impact
4. **Enter Video FPS**: Input your video's frames per second
5. **Calculate**: Get the estimated exit velocity in MPH

## Requirements

- Modern web browser with HTML5 video support
- High-frame-rate video (120fps+, 240fps recommended)
- Video should be filmed from a stable position beside the batter
- Clear view of home plate and ball during contact

## Getting Started

### Option 1: Direct Usage (Simple)

Simply open `exit-velocity-analyzer.html` in your web browser.

### Option 2: Docker (Recommended)

Run the application in a containerized environment:

```bash
# Build and start the container
docker compose up -d

# Access the application at http://localhost:6929
```

The application will be available at `http://localhost:6929`.

#### Docker Commands

```bash
# Stop the container
docker compose down

# Rebuild the container
docker compose up --build -d

# View logs
docker compose logs -f
```

## Technology Stack

- **HTML5**: Semantic markup and video element
- **CSS**: Tailwind CSS for styling
- **JavaScript**: Vanilla JS for interactivity
- **Docker**: Nginx Alpine for containerization

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
├── exit-velocity-analyzer.html  # Main application file
├── baseball-home-plate.jpg      # Home plate reference image
├── Dockerfile                   # Docker container configuration
├── compose.yml                  # Docker Compose setup
└── README.md                    # This file
```

## License

This project is open source and available for educational and personal use.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

## Support

For questions or issues, please open an issue on the repository.

---

Built with ❤️ for baseball analytics enthusiasts
