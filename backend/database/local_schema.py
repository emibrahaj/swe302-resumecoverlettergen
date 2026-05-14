"""
SQLite-flavored DDL that mirrors backend/database/migrations/000_fresh_setup.sql.

Translation rules applied:
- uuid columns -> TEXT (canonical 36-char UUID strings)
- jsonb -> TEXT (JSON-encoded; local_query.py handles encode/decode)
- text[] -> TEXT (JSON-encoded list of strings)
- timestamptz -> TEXT (ISO-8601 strings)
- gen_random_uuid() / uuid_generate_v4() -> custom SQLite function (registered in local_engine.py)
- FKs to auth.users(id) -> repointed to public.auth_users(id) (a local table we own)
- CHECK constraints preserved as-is (SQLite supports them)
"""

# Statements are executed one at a time by local_engine.init_schema().
# Order matters: dependency targets must exist before FKs reference them.

DDL_STATEMENTS = [
    # ============================================================
    # 1. Identity layer (replaces Supabase auth.users)
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        raw_user_meta_data TEXT,
        email_confirmed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        role TEXT DEFAULT 'user',
        company_id TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT,
        avatar_url TEXT,
        tier TEXT DEFAULT 'free',
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        company_name TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS company_profiles (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        company_website TEXT,
        logo_url TEXT,
        email TEXT NOT NULL UNIQUE,
        description TEXT,
        company_id TEXT,
        company_address TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES companies(id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 2. Templates catalog
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        preview_image_url TEXT,
        style_config TEXT NOT NULL DEFAULT '{}',
        is_premium INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    # ============================================================
    # 3. Resumes & cover letters
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        raw_content TEXT,
        polished_content TEXT,
        target_job_title TEXT,
        premium_analysis INTEGER DEFAULT 0,
        template_id TEXT,
        temp_token TEXT,
        ai_market_insights TEXT,
        ai_learning_recommendations TEXT,
        last_analysis_id TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES templates(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS cover_letters (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        resume_id TEXT,
        title TEXT,
        content TEXT,
        type TEXT,
        job_position TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
    )
    """,
    # ============================================================
    # 4. Jobs & matches
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS job_posting (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        company_name TEXT,
        job_title TEXT,
        required_skills TEXT DEFAULT '[]',
        salary TEXT,
        job_location TEXT,
        employment_type TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_matches (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        job_id TEXT,
        resume_id TEXT,
        cover_letter_id TEXT,
        match_score REAL NOT NULL,
        status TEXT DEFAULT 'matched',
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES job_posting(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
        FOREIGN KEY (cover_letter_id) REFERENCES cover_letters(id) ON DELETE SET NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_invitations (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        candidate_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (job_id) REFERENCES job_posting(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES user_profiles(id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 5. AI analysis tables
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS market_insights_cache (
        id TEXT PRIMARY KEY,
        job_title TEXT NOT NULL DEFAULT '',
        company_name TEXT,
        search_query TEXT UNIQUE,
        raw_scraps TEXT,
        key_skills TEXT DEFAULT '[]',
        last_updated TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS resume_feedback (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        resume_id TEXT NOT NULL,
        overall_score INTEGER CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100)),
        content_score INTEGER,
        formatting_score INTEGER,
        ats_compatibility_score INTEGER,
        suggestions TEXT,
        critical_fixes TEXT,
        learning_path TEXT,
        skill_gaps TEXT,
        experience_score INTEGER CHECK (experience_score IS NULL OR (experience_score >= 0 AND experience_score <= 100)),
        education_score INTEGER CHECK (education_score IS NULL OR (education_score >= 0 AND education_score <= 100)),
        technical_skills_score INTEGER CHECK (technical_skills_score IS NULL OR (technical_skills_score >= 0 AND technical_skills_score <= 100)),
        soft_skills_score INTEGER CHECK (soft_skills_score IS NULL OR (soft_skills_score >= 0 AND soft_skills_score <= 100)),
        achievements_score INTEGER CHECK (achievements_score IS NULL OR (achievements_score >= 0 AND achievements_score <= 100)),
        keywords_score INTEGER CHECK (keywords_score IS NULL OR (keywords_score >= 0 AND keywords_score <= 100)),
        job_relevance_score INTEGER CHECK (job_relevance_score IS NULL OR (job_relevance_score >= 0 AND job_relevance_score <= 100)),
        dimensions TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS competitor_profiles (
        id TEXT PRIMARY KEY,
        job_analysis_id TEXT,
        source TEXT,
        extracted_data TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_analysis (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        resume_id TEXT,
        output_score INTEGER,
        top_missing_skills TEXT,
        top_advice TEXT,
        competitor_profiles_id TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
        FOREIGN KEY (competitor_profiles_id) REFERENCES competitor_profiles(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS analysis_metrics (
        id TEXT PRIMARY KEY,
        job_analysis_id TEXT,
        metric_name TEXT,
        user_score REAL,
        benchmark_score REAL,
        FOREIGN KEY (job_analysis_id) REFERENCES job_analysis(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_analysis_history (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        resume_id TEXT,
        match_score INTEGER,
        skill_gap_analysis TEXT,
        cv_embedding_id TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 6. Courses (skill-gap recommendations)
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT,
        skill_category TEXT,
        affiliate_link TEXT,
        discount_code TEXT DEFAULT 'RESUME10'
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS course_usage (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        course_id TEXT,
        used_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 7. Subscriptions & payments (Stripe stub + PayPal additions)
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        price REAL,
        start_date TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        end_date TEXT,
        paypal_subscription_id TEXT UNIQUE,
        paypal_plan_id TEXT,
        cancel_at TEXT,
        last_payment_at TEXT,
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        subscription_id TEXT,
        user_id TEXT,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        stripe_payment_intent_id TEXT UNIQUE,
        paypal_order_id TEXT UNIQUE,
        paypal_subscription_id TEXT,
        paypal_capture_id TEXT,
        provider TEXT DEFAULT 'paypal',
        status TEXT NOT NULL,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS paypal_webhooks (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL UNIQUE,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        processed_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        status TEXT DEFAULT 'received'
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        subject TEXT,
        body TEXT NOT NULL,
        recipient TEXT NOT NULL DEFAULT 'endrilika18@yahoo.com',
        delivery_status TEXT NOT NULL DEFAULT 'pending',
        delivery_error TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    # ============================================================
    # 8. Indices
    # ============================================================
    "CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes (user_id)",
    "CREATE INDEX IF NOT EXISTS idx_resume_feedback_resume_id ON resume_feedback (resume_id)",
    "CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id)",
    "CREATE INDEX IF NOT EXISTS idx_payments_paypal_subscription_id ON payments (paypal_subscription_id)",
    "CREATE INDEX IF NOT EXISTS idx_paypal_webhooks_event_type ON paypal_webhooks (event_type)",
    "CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches (user_id)",
    "CREATE INDEX IF NOT EXISTS idx_job_posting_company_id ON job_posting (company_id)",
]


# Idempotent additive column migrations for databases created before a column
# was added. Each entry is (table, column, type). Engine init runs these and
# silently swallows "duplicate column" errors.
ADDITIVE_COLUMN_MIGRATIONS: list[tuple[str, str, str]] = [
    ("company_profiles", "company_address", "TEXT"),
    ("job_posting", "salary", "TEXT"),
    ("job_posting", "job_location", "TEXT"),
    ("job_posting", "employment_type", "TEXT"),
    ("job_posting", "description", "TEXT"),
]


# JSON columns: when reading these from a row, decode TEXT -> dict/list;
# when writing, encode dict/list -> TEXT.
JSON_COLUMNS = {
    "auth_users": {"raw_user_meta_data"},
    "resumes": {"raw_content", "polished_content", "ai_market_insights", "ai_learning_recommendations"},
    "templates": {"style_config"},
    "resume_feedback": {"suggestions", "critical_fixes", "learning_path", "skill_gaps", "dimensions"},
    "market_insights_cache": {"raw_scraps", "key_skills"},
    "competitor_profiles": {"extracted_data"},
    "job_analysis": {"top_missing_skills", "top_advice"},
    "user_analysis_history": {"skill_gap_analysis"},
    "job_posting": {"required_skills"},
    "paypal_webhooks": {"payload"},
}


# Tables whose boolean columns are stored as INTEGER (0/1).
# When writing Python bool -> int; when reading int -> bool.
BOOL_COLUMNS = {
    "companies": {"is_verified"},
    "templates": {"is_premium"},
    "resumes": {"premium_analysis"},
    "job_posting": {"is_active"},
}


# Seed rows inserted by init_schema() when target table is empty.
# Each entry: (table_name, [row_dicts]).
SEED_DATA = [
    (
        "templates",
        [
            {"name": "Modern Yellow",         "type": "modern",     "style_config": {"file": "template_1.html",  "accent": "#f5c518"}, "is_premium": False},
            {"name": "Professional Classic",  "type": "classic",    "style_config": {"file": "template_2.html"},                       "is_premium": False},
            {"name": "Creative Bold",         "type": "creative",   "style_config": {"file": "template_3.html",  "accent": "#088395"}, "is_premium": False},
            {"name": "Executive Elite",       "type": "executive",  "style_config": {"file": "template_4.html"},                       "is_premium": True},
            {"name": "Tech Innovator",        "type": "tech",       "style_config": {"file": "template_5.html"},                       "is_premium": False},
            {"name": "Designer Portfolio",    "type": "design",     "style_config": {"file": "template_6.html"},                       "is_premium": True},
            {"name": "Light Mint Card",       "type": "modern",     "style_config": {"file": "template_7.html",  "accent": "#10b981"}, "is_premium": False},
            {"name": "Startup Founder",       "type": "modern",     "style_config": {"file": "template_8.html"},                       "is_premium": True},
            {"name": "Minimalist Pro",        "type": "minimal",    "style_config": {"file": "template_9.html"},                       "is_premium": False},
            {"name": "Bold Statement",        "type": "creative",   "style_config": {"file": "template_10.html"},                      "is_premium": True},
            {"name": "Academic Scholar",      "type": "academic",   "style_config": {"file": "template_11.html"},                      "is_premium": False},
            {"name": "Corporate Blue",        "type": "classic",    "style_config": {"file": "template_12.html"},                      "is_premium": False},
            {"name": "Two-Column Clean",      "type": "modern",     "style_config": {"file": "template_13.html"},                      "is_premium": False},
            {"name": "Terracotta Serif",      "type": "creative",   "style_config": {"file": "template_14.html", "accent": "#c0532f"}, "is_premium": True},
        ],
    ),
    (
        "courses",
        [
            {"title": "Python for Data Science",                "skill_category": "python",             "affiliate_link": "https://www.coursera.org/learn/python"},
            {"title": "Advanced React Patterns",                "skill_category": "react",              "affiliate_link": "https://www.coursera.org/learn/react"},
            {"title": "AWS Cloud Practitioner Essentials",      "skill_category": "aws",                "affiliate_link": "https://www.aws.training/"},
            {"title": "SQL for Data Analysis",                  "skill_category": "sql",                "affiliate_link": "https://www.coursera.org/learn/sql"},
            {"title": "Machine Learning Foundations",           "skill_category": "machine learning",   "affiliate_link": "https://www.coursera.org/learn/machine-learning"},
            {"title": "Project Management Professional Prep",   "skill_category": "project management", "affiliate_link": "https://www.coursera.org/learn/pmp"},
            {"title": "Effective Communication for Engineers",  "skill_category": "communication",      "affiliate_link": "https://www.coursera.org/learn/communication"},
        ],
    ),
]
