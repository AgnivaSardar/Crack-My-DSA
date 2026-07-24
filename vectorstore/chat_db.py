import sqlite3
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "chat_history.db"

class ChatDatabaseManager:
    def __init__(self):
        # Ensure data folder exists
        DB_FILE.parent.mkdir(parents=True, exist_ok=True)
        self.conn = self._get_connection()
        self._create_tables()

    def _get_connection(self):
        conn = sqlite3.connect(str(DB_FILE), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _create_tables(self):
        cursor = self.conn.cursor()
        
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT,
            password TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Ensure password column exists if table was created previously without it
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if "password" not in columns:
            cursor.execute("ALTER TABLE users ADD COLUMN password TEXT")
        
        # Create chat sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            user_email TEXT,
            title TEXT NOT NULL,
            last_references TEXT NOT NULL, -- JSON string
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
        )
        """)
        
        # Create chat messages table
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
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        if row:
            row_dict = dict(row)
            # If password was provided and user has a password set, verify it
            if password and row_dict.get("password"):
                if row_dict["password"] != password:
                    return {"error": "Incorrect password for this email account."}
            elif password and not row_dict.get("password"):
                # Update password for existing user without password
                cursor.execute("UPDATE users SET password = ? WHERE email = ?", (password, email))
                self.conn.commit()
                row_dict["password"] = password
            return row_dict
        
        cursor.execute("INSERT INTO users (email, name, password) VALUES (?, ?, ?)", (email, name, password))
        self.conn.commit()
        return {"email": email, "name": name}

    def save_session(self, session_id: str, user_email: Optional[str], title: str, messages: List[Dict[str, Any]], last_references: List[Dict[str, Any]]):
        cursor = self.conn.cursor()
        
        # Insert or replace session
        ref_json = json.dumps(last_references, ensure_ascii=False)
        cursor.execute("""
        INSERT OR REPLACE INTO chat_sessions (id, user_email, title, last_references, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        """, (session_id, user_email.strip().lower() if user_email else None, title, ref_json))
        
        # Clear existing messages for this session
        cursor.execute("DELETE FROM chat_messages WHERE session_id = ?", (session_id,))
        
        # Insert new messages
        for msg in messages:
            cursor.execute("""
            INSERT INTO chat_messages (session_id, role, content)
            VALUES (?, ?, ?)
            """, (session_id, msg["role"], msg["content"]))
            
        self.conn.commit()

    def get_user_sessions(self, email: str) -> Dict[str, Dict[str, Any]]:
        email = email.strip().lower()
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM chat_sessions WHERE user_email = ? ORDER BY updated_at DESC", (email,))
        session_rows = cursor.fetchall()
        
        sessions = {}
        for s_row in session_rows:
            s_id = s_row["id"]
            
            # Fetch messages
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
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM chat_sessions WHERE id = ?", (session_id,))
        self.conn.commit()
