#!/usr/bin/env python3
"""
Clean up dummy accounts created by email check attempts.
Run this script to remove any accounts with username '__EMAIL_CHECK_DUMMY__'
"""

import asyncio
from sqlalchemy import select
from database import init_db, AsyncSessionLocal
from models import User


async def cleanup_dummy_accounts():
    """Remove all dummy accounts created during email checks."""
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # Find all dummy accounts
        result = await session.execute(
            select(User).where(User.username == '__EMAIL_CHECK_DUMMY__')
        )
        dummy_users = result.scalars().all()
        
        if not dummy_users:
            print("✓ No dummy accounts found")
            return
        
        print(f"Found {len(dummy_users)} dummy account(s)")
        
        # Delete them
        for user in dummy_users:
            print(f"  Deleting: {user.email} (ID: {user.id})")
            await session.delete(user)
        
        await session.commit()
        print(f"✓ Cleaned up {len(dummy_users)} dummy account(s)")


if __name__ == "__main__":
    asyncio.run(cleanup_dummy_accounts())
