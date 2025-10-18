# Use the official lightweight Nginx image
FROM nginx:alpine

# Remove the default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy your application's HTML file into the container
# We are renaming it to index.html so Nginx serves it by default
COPY exit-velocity-analyzer.html /usr/share/nginx/html/index.html
# Also copy with original name for direct access
COPY exit-velocity-analyzer.html /usr/share/nginx/html/exit-velocity-analyzer.html

# Copy the home plate image
COPY baseball-home-plate.jpg /usr/share/nginx/html/baseball-home-plate.jpg

# Copy privacy and terms pages
COPY privacy.html /usr/share/nginx/html/privacy.html
COPY terms.html /usr/share/nginx/html/terms.html

# Expose port 80 to the Docker host
EXPOSE 80
