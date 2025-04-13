# Database Migrations

This directory contains SQL migration files to update your database schema.

## How to Run Migrations

### Using Supabase Dashboard (Recommended)

1. Navigate to your Supabase project dashboard
2. Go to the SQL Editor tab
3. Create a new query
4. Paste the contents of the migration file (e.g., `add_participants_column.sql`)
5. Run the query

### Using psql (Command Line)

If you have direct access to your database:

```bash
psql -U your_username -d your_database -f add_participants_column.sql
```

Replace `your_username` and `your_database` with your actual PostgreSQL username and database name.

## Migration Files

- `add_participants_column.sql`: Adds the 'participants' column to the bookings table, which is required for the booking system to function properly.
- `add_travel_date_column.sql`: Adds the 'travel_date' column to the bookings table, which is required for all booking types.
- `fix_guests_column.sql`: Makes the 'guests' column nullable to fix issues with travel bookings that don't require guest counts. 