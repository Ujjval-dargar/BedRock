import asyncio
import sys
from sqlalchemy import text
from database import engine

async def update_schema():
    try:
        async with engine.begin() as conn:
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
