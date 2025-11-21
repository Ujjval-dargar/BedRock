import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'bedrock.db')

def migrate():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Starting migration: Adding is_first_login column...")
        
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_first_login' in columns:
            print("✓ Column is_first_login already exists, skipping migration")
            return
        
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN is_first_login BOOLEAN NOT NULL DEFAULT 1
        """)
        
        conn.commit()
        print("Migration completed successfully!")
        print("Added is_first_login column to users table")
        print("Default value: True (tutorial will be shown)")
        print("Existing users will see tutorial on next login")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
