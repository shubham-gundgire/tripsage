# Supabase Database Migrations

This directory contains database migrations for the TripSage application.

## Running Migrations

### Add Columns to Bookings Table

To add the required `hotel_details` and `travel_details` columns to your bookings table:

1. Make sure you have the Supabase CLI installed:
   ```
   npm install -g supabase
   ```

2. Link your project (if not already linked):
   ```
   supabase link --project-ref your-project-ref
   ```

3. Apply the migration:
   ```
   supabase db push
   ```

4. Alternatively, you can run the SQL file directly in the Supabase SQL Editor:
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor
   - Copy the contents of `migrations/add_columns_to_bookings.sql` and run it

5. After applying the migration, test the API endpoint:
   ```
   curl -X POST http://localhost:3000/api/db/alter-bookings-table
   ```

### Manual Column Addition

If you prefer to add the columns manually, execute this SQL in the Supabase SQL Editor:

```sql
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hotel_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS travel_details JSONB DEFAULT '{}'::jsonb;
``` 