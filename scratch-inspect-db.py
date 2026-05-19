import os
import sys

def main():
    # Read environment variables from .env
    env = {}
    if os.path.exists(".env"):
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        env[parts[0].strip()] = parts[1].strip()

    user = env.get("DB_USER", "postgres.mcfuvdkctbferxwpnicu")
    password = env.get("DB_PASSWORD", "RpJ9Ca8FF1wqhJ2u")
    database = env.get("DB_NAME", "postgres")
    
    # Try direct connection on port 5432 or 6543 to the pooler
    import pg8000.dbapi
    
    host = "aws-0-sa-east-1.pooler.supabase.com"
    try:
        conn = pg8000.dbapi.connect(
            user=user,
            password=password,
            host=host,
            port=5432,
            database=database,
            timeout=5
        )
        cursor = conn.cursor()
        
        # 1. Fetch current policies
        cursor.execute("SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles';")
        print("Policies on 'profiles':")
        for row in cursor.fetchall():
            print(f"- {row[0]} | CMD: {row[1]} | USING: {row[2]} | WITH CHECK: {row[3]}")
            
        # 2. Fetch all profiles
        cursor.execute("SELECT id, name, phone, telegram_token, role FROM profiles;")
        print("\nAll profiles in database:")
        for row in cursor.fetchall():
            print(f"- ID: {row[0]} | Name: {row[1]} | Phone: {row[2]} | Token: {row[3]} | Role: {row[4]}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
