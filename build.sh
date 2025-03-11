#!/bin/bash

# Build script for Medical System Frontend

echo "Building Medical System Frontend for production..."
echo "Using API URL: ${VITE_API_URL:-https://medicalsystemapi.azurewebsites.net}"

# Install dependencies
echo "Installing dependencies..."
npm install

# Run build
echo "Running build..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
  echo "Build successful! The application is ready for deployment."
  echo "To deploy to Vercel, run: vercel --prod"
else
  echo "Build failed. Please check the errors above."
  exit 1
fi 