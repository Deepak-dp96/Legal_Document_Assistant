# Database Seed Scripts

This directory contains scripts that initialize the database with default data.

## Scripts

### `create_admin.py`
Creates the default admin user if it doesn't already exist.

**Admin User Credentials:**
- **Username:** `admin`
- **Email:** `admin@gmail.com`
- **Password:** `admin`
- **Phone:** `9876543210`

## Automatic Execution

These scripts are automatically executed when the backend-gateway container starts via the `entrypoint.sh` script.

The execution order is:
1. Wait for database to be ready
2. Run seed scripts (create admin user)
3. Start the FastAPI application

## Manual Execution

To manually run the seed scripts inside the container:

```bash
docker exec backend-gateway python seed_scripts/create_admin.py
```

## Adding New Seed Scripts

1. Create a new Python script in this directory
2. Follow the same pattern as `create_admin.py`
3. Add the script execution to `entrypoint.sh`

## Notes

- Seed scripts are idempotent - they check if data already exists before creating it
- The admin user is only created once on first startup
- If you need to recreate the admin user, delete it from the database first
