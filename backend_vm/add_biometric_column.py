"""
Migration script to add biometric_enabled column to users table
"""
import sqlite3

def add_biometric_column():
    db_path = "bedrock.db"
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if 'biometric_enabled' not in column_names:
        print("Adding biometric_enabled column to users table...")
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN biometric_enabled INTEGER NOT NULL DEFAULT 0
        """)
        conn.commit()
        print("✅ Column added successfully!")
    else:
        print("ℹ️  biometric_enabled column already exists")
    
    conn.close()

if __name__ == "__main__":
    add_biometric_column()
