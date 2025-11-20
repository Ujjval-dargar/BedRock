"""
Migration script to add biometric_device_id column to users table
"""
import sqlite3

def add_device_id_column():
    conn = sqlite3.connect('bedrock.db')
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]
    
    if 'biometric_device_id' not in column_names:
        print("Adding biometric_device_id column to users table...")
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN biometric_device_id TEXT
        """)
        conn.commit()
        print("✅ biometric_device_id column added successfully")
    else:
        print("ℹ️  biometric_device_id column already exists")
    
    conn.close()

if __name__ == '__main__':
    add_device_id_column()
