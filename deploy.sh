#!/bin/bash
set -e

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Restarting app..."
pm2 restart feastfly

echo "Done. App is live."
pm2 status feastfly
