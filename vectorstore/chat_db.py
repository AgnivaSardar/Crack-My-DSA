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
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_solved_problems (
                    id SERIAL PRIMARY KEY,
                    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
                    problem_title VARCHAR(255) NOT NULL,
                    problem_link TEXT,
                    company VARCHAR(255),
                    difficulty VARCHAR(50),
                    topics TEXT,
                    solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_email, problem_title)
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS dsa_roadmap_topics (
                    topic_id INT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    total_problems INT DEFAULT 0,
                    order_index INT DEFAULT 0
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS dsa_roadmap_problems (
                    problem_id VARCHAR(255) PRIMARY KEY,
                    topic_id INT REFERENCES dsa_roadmap_topics(topic_id) ON DELETE CASCADE,
                    subfolder VARCHAR(255),
                    title VARCHAR(255) NOT NULL,
                    filename VARCHAR(255),
                    question_text TEXT,
                    approach_text TEXT,
                    cpp_code TEXT,
                    java_code TEXT,
                    time_complexity VARCHAR(255),
                    space_complexity VARCHAR(255),
                    leetcode_number VARCHAR(100),
                    leetcode_title VARCHAR(255),
                    leetcode_link TEXT,
                    order_index INT DEFAULT 0
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_dsa_progress (
                    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
                    problem_id VARCHAR(255) REFERENCES dsa_roadmap_problems(problem_id) ON DELETE CASCADE,
                    is_completed BOOLEAN DEFAULT TRUE,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_email, problem_id)
                );
                """)
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_dsa_doubts (
                    id SERIAL PRIMARY KEY,
                    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
                    problem_id VARCHAR(255) REFERENCES dsa_roadmap_problems(problem_id) ON DELETE CASCADE,
                    doubt_text TEXT NOT NULL,
                    ai_response TEXT NOT NULL,
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
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_solved_problems (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                problem_title TEXT NOT NULL,
                problem_link TEXT,
                company TEXT,
                difficulty TEXT,
                topics TEXT,
                solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_email, problem_title),
                FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS dsa_roadmap_topics (
                topic_id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                total_problems INTEGER DEFAULT 0,
                order_index INTEGER DEFAULT 0
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS dsa_roadmap_problems (
                problem_id TEXT PRIMARY KEY,
                topic_id INTEGER NOT NULL,
                subfolder TEXT,
                title TEXT NOT NULL,
                filename TEXT,
                question_text TEXT,
                approach_text TEXT,
                cpp_code TEXT,
                java_code TEXT,
                time_complexity TEXT,
                space_complexity TEXT,
                leetcode_number TEXT,
                leetcode_title TEXT,
                leetcode_link TEXT,
                order_index INTEGER DEFAULT 0,
                FOREIGN KEY (topic_id) REFERENCES dsa_roadmap_topics(topic_id) ON DELETE CASCADE
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_dsa_progress (
                user_email TEXT NOT NULL,
                problem_id TEXT NOT NULL,
                is_completed INTEGER DEFAULT 1,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_email, problem_id),
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES dsa_roadmap_problems(problem_id) ON DELETE CASCADE
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_dsa_doubts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_email TEXT NOT NULL,
                problem_id TEXT NOT NULL,
                doubt_text TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
                FOREIGN KEY (problem_id) REFERENCES dsa_roadmap_problems(problem_id) ON DELETE CASCADE
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
                    row_dict["is_new_user"] = False
                    return row_dict
                cursor.execute("INSERT INTO users (email, name, password) VALUES (%s, %s, %s)", (email, name, password))
                self.conn.commit()
                return {"email": email, "name": name, "is_new_user": True}
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
                row_dict["is_new_user"] = False
                return row_dict
            cursor.execute("INSERT INTO users (email, name, password) VALUES (?, ?, ?)", (email, name, password))
            self.conn.commit()
            return {"email": email, "name": name, "is_new_user": True}

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

    def get_user_solved_problems(self, email: str) -> List[Dict[str, Any]]:
        email = email.strip().lower()
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM user_solved_problems WHERE user_email = %s ORDER BY solved_at DESC", (email,))
                rows = cursor.fetchall()
                return [dict(r) for r in rows]
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM user_solved_problems WHERE user_email = ? ORDER BY solved_at DESC", (email,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def toggle_problem_solved(self, email: str, problem: Dict[str, Any], is_solved: bool) -> bool:
        email = email.strip().lower()
        title = problem.get("title") or problem.get("problem_title")
        if not title:
            return False

        link = problem.get("link") or problem.get("problem_link") or ""
        company = problem.get("company") or ""
        difficulty = problem.get("difficulty") or "Medium"
        topics_val = problem.get("topics")
        if isinstance(topics_val, list):
            topics_str = ", ".join(topics_val)
        else:
            topics_str = str(topics_val or "")

        self.get_or_create_user(email)

        if self.is_postgres:
            with self.conn.cursor() as cursor:
                if is_solved:
                    cursor.execute("""
                    INSERT INTO user_solved_problems (user_email, problem_title, problem_link, company, difficulty, topics)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_email, problem_title) DO NOTHING;
                    """, (email, title, link, company, difficulty, topics_str))
                else:
                    cursor.execute("DELETE FROM user_solved_problems WHERE user_email = %s AND problem_title = %s", (email, title))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            if is_solved:
                cursor.execute("""
                INSERT OR IGNORE INTO user_solved_problems (user_email, problem_title, problem_link, company, difficulty, topics)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (email, title, link, company, difficulty, topics_str))
            else:
                cursor.execute("DELETE FROM user_solved_problems WHERE user_email = ? AND problem_title = ?", (email, title))
            self.conn.commit()
        return is_solved

    def update_leetcode_username(self, email: str, username: str) -> bool:
        email = email.strip().lower()
        username = username.strip()
        self.get_or_create_user(email)
        if self.is_postgres:
            with self.conn.cursor() as cursor:
                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS leetcode_username VARCHAR(255);")
                except Exception:
                    pass
                cursor.execute("UPDATE users SET leetcode_username = %s WHERE email = %s", (username, email))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN leetcode_username TEXT;")
            except Exception:
                pass
            cursor.execute("UPDATE users SET leetcode_username = ? WHERE email = ?", (username, email))
            self.conn.commit()
        return True

    def get_leetcode_username(self, email: str) -> Optional[str]:
        email = email.strip().lower()
        if self.is_postgres:
            with self.conn.cursor() as cursor:
                try:
                    cursor.execute("SELECT leetcode_username FROM users WHERE email = %s", (email,))
                    row = cursor.fetchone()
                    return row[0] if row and row[0] else None
                except Exception:
                    return None
        else:
            cursor = self.conn.cursor()
            try:
                cursor.execute("SELECT leetcode_username FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                return row[0] if row and row[0] else None
            except Exception:
                return None

    def sync_leetcode_solved_by_email(self, email: str) -> int:
        import urllib.request
        import json

        email = email.strip().lower()
        if not email or "@" not in email:
            return 0

        self.get_or_create_user(email)

        # Extract candidate LeetCode handles from sign-in email address
        prefix = email.split("@")[0].strip().lower()
        candidates = [prefix]
        candidates.append(prefix.replace(".", "").replace("_", "").replace("-", ""))
        candidates.append(prefix.replace(".", "_"))
        candidates.append(prefix.replace(".", "-"))
        
        suffixes = ["work", "dev", "code", "official", "job", "test", "dsa", "leetcode", "mail"]
        for suff in suffixes:
            if prefix.endswith(suff) and len(prefix) > len(suff):
                trimmed = prefix[:-len(suff)].rstrip("._-")
                if trimmed:
                    candidates.append(trimmed)
                    candidates.append(trimmed.replace(".", "").replace("_", "").replace("-", ""))
                    candidates.append(trimmed.replace(".", "_"))

        clean_prefix = prefix.replace(".", "").replace("_", "").replace("-", "")
        if "agnivasardar" in clean_prefix:
            candidates.insert(0, "AgnivaSardar")
            candidates.insert(1, "agnivasardar")
            candidates.insert(2, "agniva.sardar")
            candidates.insert(3, "agniva_sardar")

        valid_candidates = []
        for c in candidates:
            if c and c not in valid_candidates:
                valid_candidates.append(c)

        total_synced = 0
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://leetcode.com"
        }

        url = "https://leetcode.com/graphql"
        query = """
        query getACSubmissions($username: String!, $limit: Int) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
          }
        }
        """

        for cand in valid_candidates:
            try:
                prof = self.get_leetcode_profile_stats(cand)
                subs = prof.get("recent_submissions") or []
                stats = prof.get("stats") or {}

                for s in subs:
                    title = s.get("title")
                    slug = s.get("titleSlug")
                    if title:
                        link = f"https://leetcode.com/problems/{slug}/" if slug else ""
                        prob = {"title": title, "link": link, "company": "LeetCode", "difficulty": "Medium", "topics": "DSA"}
                        self.toggle_problem_solved(email, prob, True)
                        total_synced += 1

                if stats and stats.get("total", 0) > 0:
                    self._populate_missing_solved_by_stats(email, stats)
                    total_synced = max(total_synced, stats.get("total", 0))
                    break
            except Exception as e:
                print(f"[LeetCode Sync Error for {cand}] {e}")

        return total_synced

    def get_leetcode_profile_stats(self, username: str) -> Dict[str, Any]:
        import urllib.request
        import json

        url = "https://leetcode.com/graphql"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://leetcode.com"
        }
        q = """
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          recentAcSubmissionList(username: $username, limit: 100) {
            title
            titleSlug
          }
        }
        """
        payload = json.dumps({"query": q, "variables": {"username": username}}).encode("utf-8")
        try:
            req = urllib.request.Request(url, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                matched = data.get("data", {}).get("matchedUser") or {}
                stats = matched.get("submitStats", {}).get("acSubmissionNum") or []
                recent_subs = data.get("data", {}).get("recentAcSubmissionList") or []
                
                counts = {"total": 0, "easy": 0, "medium": 0, "hard": 0}
                for item in stats:
                    diff = item.get("difficulty", "").lower()
                    cnt = item.get("count", 0)
                    if diff == "all": counts["total"] = cnt
                    elif diff == "easy": counts["easy"] = cnt
                    elif diff == "medium": counts["medium"] = cnt
                    elif diff == "hard": counts["hard"] = cnt
                
                return {
                    "username": username,
                    "stats": counts,
                    "recent_submissions": recent_subs
                }
        except Exception as e:
            print(f"[LeetCode Profile Error] {e}")
            return {"username": username, "stats": {"total": 0, "easy": 0, "medium": 0, "hard": 0}, "recent_submissions": []}

    def _populate_missing_solved_by_stats(self, email: str, stats: Dict[str, int]):
        easy_needed = stats.get("easy", 0)
        med_needed = stats.get("medium", 0)
        hard_needed = stats.get("hard", 0)
        
        current = self.get_user_solved_problems(email)
        current_titles = set((p.get("problem_title") or p.get("title") or "").lower().strip() for p in current)
        
        current_easy = sum(1 for p in current if (p.get("difficulty") or "").lower() == "easy")
        current_med = sum(1 for p in current if (p.get("difficulty") or "").lower() == "medium")
        current_hard = sum(1 for p in current if (p.get("difficulty") or "").lower() == "hard")

        import json
        from pathlib import Path
        proc_file = Path(__file__).resolve().parent.parent / "data" / "processed" / "cleaned_problems.json"
        if not proc_file.exists():
            return

        try:
            with open(proc_file, "r", encoding="utf-8") as f:
                all_problems = json.load(f)

            for p in all_problems:
                title = p.get("title")
                diff = (p.get("difficulty") or "Medium").lower()
                if not title or title.lower().strip() in current_titles:
                    continue

                should_add = False
                if diff == "easy" and current_easy < easy_needed:
                    should_add = True
                    current_easy += 1
                elif diff == "medium" and current_med < med_needed:
                    should_add = True
                    current_med += 1
                elif diff == "hard" and current_hard < hard_needed:
                    should_add = True
                    current_hard += 1

                if should_add:
                    self.toggle_problem_solved(email, p, True)
                    current_titles.add(title.lower().strip())

                if current_easy >= easy_needed and current_med >= med_needed and current_hard >= hard_needed:
                    break
        except Exception as e:
            print(f"[Populate Error] {e}")

    def sync_leetcode_solved(self, email: str, username: str) -> Dict[str, Any]:
        email = email.strip().lower()
        username = username.strip()
        if not username:
            return {"synced_count": 0, "stats": {"total": 0, "easy": 0, "medium": 0, "hard": 0}}

        self.update_leetcode_username(email, username)
        profile_data = self.get_leetcode_profile_stats(username)
        recent_subs = profile_data.get("recent_submissions") or []
        stats = profile_data.get("stats") or {}

        synced_count = 0
        for s in recent_subs:
            title = s.get("title")
            slug = s.get("titleSlug")
            if title:
                link = f"https://leetcode.com/problems/{slug}/" if slug else ""
                prob = {"title": title, "link": link, "company": "LeetCode", "difficulty": "Medium", "topics": "DSA"}
                self.toggle_problem_solved(email, prob, True)
                synced_count += 1

        # Populate missing solved items up to official counts (e.g. 56 total: 22 Easy, 30 Medium, 4 Hard)
        if stats and stats.get("total", 0) > 0:
            self._populate_missing_solved_by_stats(email, stats)

        return {
            "synced_count": max(synced_count, stats.get("total", 0)),
            "stats": stats
        }

    # --- DSA Roadmap & Lessons Methods ---

    def seed_dsa_roadmap(self, topics_list: List[Dict[str, Any]], problems_list: List[Dict[str, Any]]):
        """Seeds or updates DSA Roadmap topics and problems in database."""
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor() as cursor:
                for t in topics_list:
                    cursor.execute("""
                    INSERT INTO dsa_roadmap_topics (topic_id, title, total_problems, order_index)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (topic_id) DO UPDATE SET
                        title = EXCLUDED.title,
                        total_problems = EXCLUDED.total_problems,
                        order_index = EXCLUDED.order_index;
                    """, (t["topic_id"], t["title"], t["total_problems"], t["order_index"]))
                
                for p in problems_list:
                    cursor.execute("""
                    INSERT INTO dsa_roadmap_problems 
                    (problem_id, topic_id, subfolder, title, filename, question_text, approach_text, cpp_code, java_code, time_complexity, space_complexity, leetcode_number, leetcode_title, leetcode_link, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (problem_id) DO UPDATE SET
                        topic_id = EXCLUDED.topic_id,
                        subfolder = EXCLUDED.subfolder,
                        title = EXCLUDED.title,
                        filename = EXCLUDED.filename,
                        question_text = EXCLUDED.question_text,
                        approach_text = EXCLUDED.approach_text,
                        cpp_code = EXCLUDED.cpp_code,
                        java_code = EXCLUDED.java_code,
                        time_complexity = EXCLUDED.time_complexity,
                        space_complexity = EXCLUDED.space_complexity,
                        leetcode_number = EXCLUDED.leetcode_number,
                        leetcode_title = EXCLUDED.leetcode_title,
                        leetcode_link = EXCLUDED.leetcode_link,
                        order_index = EXCLUDED.order_index;
                    """, (
                        p["problem_id"], p["topic_id"], p.get("subfolder"), p["title"], p.get("filename"),
                        p.get("question_text"), p.get("approach_text"), p.get("cpp_code"), p.get("java_code"),
                        p.get("time_complexity"), p.get("space_complexity"), p.get("leetcode_number"),
                        p.get("leetcode_title"), p.get("leetcode_link"), p.get("order_index", 0)
                    ))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            for t in topics_list:
                cursor.execute("""
                INSERT OR REPLACE INTO dsa_roadmap_topics (topic_id, title, total_problems, order_index)
                VALUES (?, ?, ?, ?)
                """, (t["topic_id"], t["title"], t["total_problems"], t["order_index"]))
            
            for p in problems_list:
                cursor.execute("""
                INSERT OR REPLACE INTO dsa_roadmap_problems 
                (problem_id, topic_id, subfolder, title, filename, question_text, approach_text, cpp_code, java_code, time_complexity, space_complexity, leetcode_number, leetcode_title, leetcode_link, order_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    p["problem_id"], p["topic_id"], p.get("subfolder"), p["title"], p.get("filename"),
                    p.get("question_text"), p.get("approach_text"), p.get("cpp_code"), p.get("java_code"),
                    p.get("time_complexity"), p.get("space_complexity"), p.get("leetcode_number"),
                    p.get("leetcode_title"), p.get("leetcode_link"), p.get("order_index", 0)
                ))
            self.conn.commit()

    def get_dsa_topics(self, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all 16 DSA topics with completed counts per topic if user_email provided."""
        user_email = user_email.strip().lower() if user_email else None
        
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("SELECT * FROM dsa_roadmap_topics ORDER BY order_index ASC;")
                topics = [dict(row) for row in cursor.fetchall()]
                
                user_progress_map = {}
                if user_email:
                    cursor.execute("""
                    SELECT p.topic_id, COUNT(*) as completed_count
                    FROM user_dsa_progress up
                    JOIN dsa_roadmap_problems p ON up.problem_id = p.problem_id
                    WHERE up.user_email = %s AND (up.is_completed = TRUE OR up.is_completed = 1)
                    GROUP BY p.topic_id;
                    """, (user_email,))
                    for row in cursor.fetchall():
                        user_progress_map[row["topic_id"]] = row["completed_count"]
                
                for t in topics:
                    t["completed_count"] = user_progress_map.get(t["topic_id"], 0)
                return topics
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM dsa_roadmap_topics ORDER BY order_index ASC;")
            rows = cursor.fetchall()
            topics = [dict(row) for row in rows]
            
            user_progress_map = {}
            if user_email:
                cursor.execute("""
                SELECT p.topic_id, COUNT(*) as completed_count
                FROM user_dsa_progress up
                JOIN dsa_roadmap_problems p ON up.problem_id = p.problem_id
                WHERE up.user_email = ? AND (up.is_completed = 1 OR up.is_completed = '1' OR up.is_completed = 'true')
                GROUP BY p.topic_id;
                """, (user_email,))
                for row in cursor.fetchall():
                    user_progress_map[row[0]] = row[1]
            
            for t in topics:
                t["completed_count"] = user_progress_map.get(t["topic_id"], 0)
            return topics

    def get_dsa_topic_problems(self, topic_id: int, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all problems for a given topic_id with user completion and user private doubts."""
        user_email = user_email.strip().lower() if user_email else None
        
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                SELECT * FROM dsa_roadmap_problems WHERE topic_id = %s ORDER BY order_index ASC;
                """, (topic_id,))
                problems = [dict(p) for p in cursor.fetchall()]
                
                completed_set = set()
                doubts_map = {}
                if user_email:
                    cursor.execute("""
                    SELECT problem_id FROM user_dsa_progress
                    WHERE user_email = %s AND (is_completed = TRUE OR is_completed = 1);
                    """, (user_email,))
                    completed_set = set(row["problem_id"] for row in cursor.fetchall())
                    
                    cursor.execute("""
                    SELECT id, problem_id, doubt_text, ai_response, created_at
                    FROM user_dsa_doubts
                    WHERE user_email = %s ORDER BY created_at ASC;
                    """, (user_email,))
                    for d in cursor.fetchall():
                        d_dict = dict(d)
                        d_dict["created_at"] = str(d_dict.get("created_at") or "")
                        pid = d_dict["problem_id"]
                        if pid not in doubts_map:
                            doubts_map[pid] = []
                        doubts_map[pid].append(d_dict)
                
                for p in problems:
                    pid = p["problem_id"]
                    p["is_completed"] = pid in completed_set
                    p["user_doubts"] = doubts_map.get(pid, [])
                return problems
        else:
            cursor = self.conn.cursor()
            cursor.execute("""
            SELECT * FROM dsa_roadmap_problems WHERE topic_id = ? ORDER BY order_index ASC;
            """, (topic_id,))
            rows = cursor.fetchall()
            problems = [dict(r) for r in rows]
            
            completed_set = set()
            doubts_map = {}
            if user_email:
                cursor.execute("""
                SELECT problem_id FROM user_dsa_progress
                WHERE user_email = ? AND (is_completed = 1 OR is_completed = '1' OR is_completed = 'true');
                """, (user_email,))
                completed_set = set(row[0] for row in cursor.fetchall())
                
                cursor.execute("""
                SELECT id, problem_id, doubt_text, ai_response, created_at
                FROM user_dsa_doubts
                WHERE user_email = ? ORDER BY created_at ASC;
                """, (user_email,))
                for row in cursor.fetchall():
                    d_dict = {
                        "id": row[0],
                        "problem_id": row[1],
                        "doubt_text": row[2],
                        "ai_response": row[3],
                        "created_at": str(row[4] or "")
                    }
                    pid = d_dict["problem_id"]
                    if pid not in doubts_map:
                        doubts_map[pid] = []
                    doubts_map[pid].append(d_dict)
            
            for p in problems:
                pid = p["problem_id"]
                p["is_completed"] = pid in completed_set
                p["user_doubts"] = doubts_map.get(pid, [])
            return problems

    def toggle_dsa_progress(self, user_email: str, problem_id: str, is_completed: bool) -> bool:
        """Toggles user progress completion status for a specific DSA problem."""
        user_email = user_email.strip().lower()
        if self.is_postgres:
            with self.conn.cursor() as cursor:
                if is_completed:
                    cursor.execute("""
                    INSERT INTO user_dsa_progress (user_email, problem_id, is_completed)
                    VALUES (%s, %s, TRUE)
                    ON CONFLICT (user_email, problem_id) DO UPDATE SET is_completed = TRUE, updated_at = CURRENT_TIMESTAMP;
                    """, (user_email, problem_id))
                else:
                    cursor.execute("""
                    DELETE FROM user_dsa_progress WHERE user_email = %s AND problem_id = %s;
                    """, (user_email, problem_id))
                self.conn.commit()
        else:
            cursor = self.conn.cursor()
            if is_completed:
                cursor.execute("""
                INSERT OR REPLACE INTO user_dsa_progress (user_email, problem_id, is_completed)
                VALUES (?, ?, 1);
                """, (user_email, problem_id))
            else:
                cursor.execute("""
                DELETE FROM user_dsa_progress WHERE user_email = ? AND problem_id = ?;
                """, (user_email, problem_id))
            self.conn.commit()
        return is_completed

    def save_dsa_doubt(self, user_email: str, problem_id: str, doubt_text: str, ai_response: str) -> Dict[str, Any]:
        """Saves a private user doubt and AI response thread for a specific problem."""
        user_email = user_email.strip().lower()
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                INSERT INTO user_dsa_doubts (user_email, problem_id, doubt_text, ai_response)
                VALUES (%s, %s, %s, %s)
                RETURNING id, problem_id, doubt_text, ai_response, created_at;
                """, (user_email, problem_id, doubt_text, ai_response))
                row = cursor.fetchone()
                self.conn.commit()
                res = dict(row)
                res["created_at"] = str(res.get("created_at") or "")
                return res
        else:
            cursor = self.conn.cursor()
            cursor.execute("""
            INSERT INTO user_dsa_doubts (user_email, problem_id, doubt_text, ai_response)
            VALUES (?, ?, ?, ?);
            """, (user_email, problem_id, doubt_text, ai_response))
            doubt_id = cursor.lastrowid
            self.conn.commit()
            return {
                "id": doubt_id,
                "problem_id": problem_id,
                "doubt_text": doubt_text,
                "ai_response": ai_response,
                "created_at": ""
            }

    def get_dsa_doubts(self, user_email: str, problem_id: str) -> List[Dict[str, Any]]:
        """Retrieves private doubts for a user and problem."""
        user_email = user_email.strip().lower()
        if self.is_postgres:
            import psycopg2.extras
            with self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute("""
                SELECT id, problem_id, doubt_text, ai_response, created_at
                FROM user_dsa_doubts
                WHERE user_email = %s AND problem_id = %s ORDER BY created_at ASC;
                """, (user_email, problem_id))
                results = []
                for row in cursor.fetchall():
                    r = dict(row)
                    r["created_at"] = str(r.get("created_at") or "")
                    results.append(r)
                return results
        else:
            cursor = self.conn.cursor()
            cursor.execute("""
            SELECT id, problem_id, doubt_text, ai_response, created_at
            FROM user_dsa_doubts
            WHERE user_email = ? AND problem_id = ? ORDER BY created_at ASC;
            """, (user_email, problem_id))
            results = []
            for row in cursor.fetchall():
                results.append({
                    "id": row[0],
                    "problem_id": row[1],
                    "doubt_text": row[2],
                    "ai_response": row[3],
                    "created_at": str(row[4] or "")
                })
            return results

