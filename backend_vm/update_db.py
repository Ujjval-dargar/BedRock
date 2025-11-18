#!/usr/bin/env python3
"""
Update database schema to add permission column to shared_passwords table.
Run this after updating the model to add the permission field.
"""
import asyncio
import sys
from sqlalchemy import text
from database import engine

async def update_schema():
    """Add permission column to shared_passwords table if it doesn't exist."""
    try:
        async with engine.begin() as conn:
            # Check if column exists
            result = await conn.execute(text(
                "SELECT COUNT(*) FROM pragma_table_info('shared_passwords') WHERE name='permission'"
            ))
            count = result.scalar()
            
            if count == 0:
                print("Adding permission column to shared_passwords table...")
                await conn.execute(text(
                    "ALTER TABLE shared_passwords ADD COLUMN permission VARCHAR(20) DEFAULT 'view'"
                ))
                print("✓ Permission column added successfully")
            else:
                print("✓ Permission column already exists")
                
            # Update existing rows to have 'view' permission if NULL
            await conn.execute(text(
                "UPDATE shared_passwords SET permission = 'view' WHERE permission IS NULL"
            ))
            print("✓ Updated existing shares to have 'view' permission")
            
    except Exception as e:
        print(f"✗ Error updating database: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    print("Database Schema Update")
    print("=" * 50)
    asyncio.run(update_schema())
    print("=" * 50)
    print("Update complete! You can now restart the backend server.")
