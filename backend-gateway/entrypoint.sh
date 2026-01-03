#!/bin/bash
set -e

echo "Starting backend-gateway initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Initialize database tables
echo "Initializing database..."
python seed_scripts/init_db.py

# Run seed scripts
echo "Running seed scripts..."
python seed_scripts/create_admin.py

# Start the application
echo "Starting FastAPI application..."
exec "$@"
