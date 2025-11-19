"""
Migration script to add recovery_key_hash column to users table
"""
import sqlite3

def add_recovery_key_column():
    conn = sqlite3.connect('bedrock.db')
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'recovery_key_hash' not in columns:
            print("Adding recovery_key_hash column to users table...")
            cursor.execute('''
                ALTER TABLE users 
                ADD COLUMN recovery_key_hash TEXT
            ''')
            conn.commit()
            print("✅ Column added successfully!")
        else:
            print("✅ Column already exists!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_recovery_key_column()
