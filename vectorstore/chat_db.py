import os
import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "chat_history.db"

class ChatDatabaseManager:
    def __init__(self):
        self.is_postgres = False
        self.conn = self._get_connection()
        self._create_tables()

    def _get_connection(self):
        pg_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
        if pg_url:
            try:
                import psycopg2
                import psycopg2.extras
                # Handle raw @ in password if unencoded
                if "@" in pg_url and "%40" not in pg_url:
                    parts = pg_url.split("://")
                    if len(parts) == 2:
                        user_pass_host = parts[1].split("@")
                        if len(user_pass_host) >= 3:
                            user_pass = user_pass_host[0] + "%40" + user_pass_host[1]
                            host_db = "@".join(user_pass_host[2:])
                            pg_url = f"{parts[0]}://{user_pass}@{host_db}"
                
                conn = psycopg2.connect(pg_url)
                self.is_postgres = True
                print("ChatDatabaseManager: Connected to Supabase PostgreSQL database.")
                return conn
            except Exception as e:
                print(f"ChatDatabaseManager warning: PostgreSQL connection failed ({e}), falling back to SQLite.")

        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(DB_FILE), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        self.is_postgres = False
        return conn

    def _create_tables(self):
        if self.is_postgres:
            with self.conn.cursor() as cursor:
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    email VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255),
                    password VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id VARCHAR(255) PRIMARY KEY,
                    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
                    title TEXT NOT NULL,
                    last_references TEXT NOT NULL,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) REFERENCES chat_sessions(id) ON DELETE CASCADE,
                    role VARCHAR(50) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """)
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT,
                password TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """)
            cursor.execute("PRAGMA table_info(users)")
            columns = [column[1] for column in cursor.fetchall()]
            if "password" not in columns:
                cursor.execute("ALTER TABLE users ADD COLUMN password TEXT")
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id TEXT PRIMARY KEY,
                user_email TEXT,
                title TEXT NOT NULL,
                last_references TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
            )
            """)
            self.conn.commit()

    def get_or_create_user(self, email: str, name: Optional[str] = None, password: Optional[str] = None) -> Dict[str, Any]:
        email = email.strip().lower()
        if not name:
            name = email.split('@')[0]

        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
                row = cursor.fetchone()
                if row:
                    row_dict = dict(row)
                    if password and row_dict.get("password"):
                        if row_dict["password"] != password:
                            return {"error": "Incorrect password for this email account."}
                    elif password and not row_dict.get("password"):
                        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (password, email))
                        self.conn.commit()
                        row_dict["password"] = password
                    return row_dict
                cursor.execute("INSERT INTO users (email, name, password) VALUES (%s, %s, %s)", (email, name, password))
                self.conn.commit()
                return {"email": email, "name": name}
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                row_dict = dict(row)
                if password and row_dict.get("password"):
                    if row_dict["password"] != password:
                        return {"error": "Incorrect password for this email account."}
                elif password and not row_dict.get("password"):
                    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (password, email))
                    self.conn.commit()
                    row_dict["password"] = password
                return row_dict
            cursor.execute("INSERT INTO users (email, name, password) VALUES (?, ?, ?)", (email, name, password))
            self.conn.commit()
            return {"email": email, "name": name}

    def save_session(self, session_id: str, user_email: Optional[str], title: str, messages: List[Dict[str, Any]], last_references: List[Dict[str, Any]]):
        ref_json = json.dumps(last_references, ensure_ascii=False)
        user_email_clean = user_email.strip().lower() if user_email and user_email.strip() else None

        if user_email_clean:
            try:
                self.get_or_create_user(user_email_clean)
            except Exception as e:
                print(f"ChatDatabaseManager get_or_create_user warning: {e}")

        if self.is_postgres:
            with self.conn.cursor() as cursor:
                cursor.execute("""
                INSERT INTO chat_sessions (id, user_email, title, last_references, updated_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    user_email = EXCLUDED.user_email,
                    title = EXCLUDED.title,
                    last_references = EXCLUDED.last_references,
                    updated_at = CURRENT_TIMESTAMP;
                """, (session_id, user_email_clean, title, ref_json))

                cursor.execute("DELETE FROM chat_messages WHERE session_id = %s", (session_id,))
                for msg in messages:
                    cursor.execute("""
                    INSERT INTO chat_messages (session_id, role, content)
                    VALUES (%s, %s, %s)
                    """, (session_id, msg["role"], msg["content"]))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO chat_sessions (id, user_email, title, last_references, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (session_id, user_email_clean, title, ref_json))

            cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
            for msg in messages:
                cursor.execute("""
                INSERT INTO chat_messages (session_id, role, content)
                VALUES (?, ?, ?)
                """, (session_id, msg["role"], msg["content"]))
            self.conn.commit()

    def get_user_sessions(self, email: str) -> Dict[str, Dict[str, Any]]:
        email = email.strip().lower()

        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM chat_sessions WHERE user_email = %s ORDER BY updated_at DESC", (email,))
                session_rows = cursor.fetchall()
                sessions = {}
                for s_row in session_rows:
                    s_id = s_row["id"]
                    cursor.execute("SELECT role, content FROM chat_messages WHERE session_id = %s ORDER BY id ASC", (s_id,))
                    msg_rows = cursor.fetchall()
                    messages = [{"role": m["role"], "content": m["content"]} for m in msg_rows]
                    sessions[s_id] = {
                        "title": s_row["title"],
                        "last_references": json.loads(s_row["last_references"]) if isinstance(s_row["last_references"], str) else s_row["last_references"],
                        "messages": messages
                    }
                return sessions
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM chat_sessions WHERE user_email = ? ORDER BY updated_at DESC", (email,))
            session_rows = cursor.fetchall()
            sessions = {}
            for s_row in session_rows:
                s_id = s_row["id"]
                cursor.execute("SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC", (s_id,))
                msg_rows = cursor.fetchall()
                messages = [{"role": m["role"], "content": m["content"]} for m in msg_rows]
                sessions[s_id] = {
                    "title": s_row["title"],
                    "last_references": json.loads(s_row["last_references"]),
                    "messages": messages
                }
            return sessions

    def delete_session(self, session_id: str):
        if self.is_postgres:
            with self.conn.cursor() as cursor:
                cursor.execute("DELETE FROM chat_sessions WHERE id = %s", (session_id,))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
            self.conn.commit()
