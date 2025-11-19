"""
Clean All Database Records
===========================
This script removes ALL records from all tables in the BedRock database.
⚠️  WARNING: This is irreversible! All user data will be permanently deleted.

Usage:
    python clean_all_records.py

Tables cleaned:
    - shared_passwords (password shares between users)
    - password_entries (user passwords)
    - users (user accounts)
"""

import sqlite3
import sys
from pathlib import Path


def clean_all_records(db_path: str = "bedrock.db"):
    """Remove all records from all tables in the database."""
    
    # Confirm deletion
    print("⚠️  WARNING: This will delete ALL data from the database!")
    print("\nTables that will be cleared:")
    print("  - shared_passwords (all password shares)")
    print("  - password_entries (all saved passwords)")
    print("  - users (all user accounts)")
    
    response = input("\nAre you sure you want to continue? Type 'YES' to confirm: ")
    
    if response != "YES":
        print("❌ Operation cancelled.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get counts before deletion
        cursor.execute("SELECT COUNT(*) FROM shared_passwords")
        shares_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM password_entries")
        entries_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        
        print(f"\n📊 Current database contents:")
        print(f"  - Users: {users_count}")
        print(f"  - Password entries: {entries_count}")
        print(f"  - Shared passwords: {shares_count}")
        
        if users_count == 0 and entries_count == 0 and shares_count == 0:
            print("\n✓ Database is already empty!")
            conn.close()
            return
        
        # Delete in correct order (respect foreign keys)
        print("\n🗑️  Deleting records...")
        
        # 1. Delete shared passwords first (depends on password_entries and users)
        cursor.execute("DELETE FROM shared_passwords")
        print(f"  ✓ Deleted {shares_count} shared password(s)")
        
        # 2. Delete password entries (depends on users)
        cursor.execute("DELETE FROM password_entries")
        print(f"  ✓ Deleted {entries_count} password entry/entries")
        
        # 3. Delete users last (no dependencies)
        cursor.execute("DELETE FROM users")
        print(f"  ✓ Deleted {users_count} user(s)")
        
        # Commit changes
        conn.commit()
        
        # Verify deletion
        cursor.execute("SELECT COUNT(*) FROM users")
        remaining_users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM password_entries")
        remaining_entries = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM shared_passwords")
        remaining_shares = cursor.fetchone()[0]
        
        if remaining_users == 0 and remaining_entries == 0 and remaining_shares == 0:
            print("\n✅ All records successfully deleted!")
            print("   Database is now empty and ready for fresh data.")
        else:
            print(f"\n⚠️  Warning: Some records may remain:")
            print(f"  - Users: {remaining_users}")
            print(f"  - Password entries: {remaining_entries}")
            print(f"  - Shared passwords: {remaining_shares}")
        
        # Optional: Reset auto-increment counters
        print("\n🔄 Resetting auto-increment counters...")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='users'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='password_entries'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='shared_passwords'")
        conn.commit()
        print("  ✓ Auto-increment counters reset")
        
        conn.close()
        
        print("\n" + "="*50)
        print("Database cleanup complete!")
        print("="*50)
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


def preview_database(db_path: str = "bedrock.db"):
    """Show current database contents without deleting."""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n📊 Current Database Contents")
        print("="*50)
        
        # Users
        cursor.execute("SELECT id, username, email FROM users")
        users = cursor.fetchall()
        print(f"\n👥 Users ({len(users)}):")
        if users:
            for user in users:
                print(f"  - ID: {user[0]}, Username: {user[1]}, Email: {user[2]}")
        else:
            print("  (none)")
        
        # Password entries
        cursor.execute("SELECT id, owner_id, title FROM password_entries")
        entries = cursor.fetchall()
        print(f"\n🔑 Password Entries ({len(entries)}):")
        if entries:
            for entry in entries:
                print(f"  - ID: {entry[0]}, Owner ID: {entry[1]}, Title: {entry[2]}")
        else:
            print("  (none)")
        
        # Shared passwords
        cursor.execute("SELECT id, from_user_id, to_user_id, status FROM shared_passwords")
        shares = cursor.fetchall()
        print(f"\n🤝 Shared Passwords ({len(shares)}):")
        if shares:
            for share in shares:
                print(f"  - ID: {share[0]}, From: {share[1]}, To: {share[2]}, Status: {share[3]}")
        else:
            print("  (none)")
        
        print("\n" + "="*50)
        conn.close()
        
    except sqlite3.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("="*50)
    print("  BedRock Database Cleanup Tool")
    print("="*50)
    
    # Check if database exists
    db_path = Path("bedrock.db")
    if not db_path.exists():
        print(f"\n❌ Database file not found: {db_path}")
        print("   Make sure you're running this from the backend_vm directory.")
        sys.exit(1)
    
    # Show menu
    print("\nOptions:")
    print("  1. Preview database contents (read-only)")
    print("  2. Clean all records (DELETE)")
    print("  3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        preview_database(str(db_path))
    elif choice == "2":
        clean_all_records(str(db_path))
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice. Exiting.")
