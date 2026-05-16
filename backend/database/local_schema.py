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
    CREATE TABLE IF NOT EXISTS auth_users
    (
        id                 TEXT PRIMARY KEY,
        email              TEXT NOT NULL UNIQUE,
        password_hash      TEXT NOT NULL,
        raw_user_meta_data TEXT,
        email_confirmed_at TEXT,
        created_at         TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS users
    (
        id         TEXT PRIMARY KEY,
        name       TEXT,
        email      TEXT NOT NULL UNIQUE,
        role       TEXT          DEFAULT 'user',
        company_id TEXT,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_profiles
    (
        id         TEXT PRIMARY KEY,
        full_name  TEXT,
        avatar_url TEXT,
        tier       TEXT DEFAULT 'free',
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS companies
    (
        id           TEXT PRIMARY KEY,
        email        TEXT NOT NULL,
        company_name TEXT NOT NULL,
        is_verified  INTEGER DEFAULT 0,
        created_at   TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES auth_users (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS company_profiles
    (
        id              TEXT PRIMARY KEY,
        company_name    TEXT NOT NULL,
        company_website TEXT,
        logo_url        TEXT,
        email           TEXT NOT NULL UNIQUE,
        description     TEXT,
        company_id      TEXT,
        company_address TEXT,
        created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (id) REFERENCES companies (id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 2. Templates catalog
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS templates
    (
        id                TEXT PRIMARY KEY,
        name              TEXT NOT NULL,
        type              TEXT NOT NULL,
        template_key      TEXT UNIQUE,
        preview_image_url TEXT,
        style_config      TEXT NOT NULL DEFAULT '{}',
        is_premium        INTEGER       DEFAULT 0,
        created_at        TEXT          DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    # ============================================================
    # 3. Resumes & cover letters
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS resumes
    (
        id                          TEXT PRIMARY KEY,
        user_id                     TEXT,
        raw_content                 TEXT,
        polished_content            TEXT,
        target_job_title            TEXT,
        premium_analysis            INTEGER DEFAULT 0,
        template_id                 TEXT,
        temp_token                  TEXT,
        ai_market_insights          TEXT,
        ai_learning_recommendations TEXT,
        last_analysis_id            TEXT,
        created_at                  TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES templates (id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS cover_letters
    (
        id           TEXT PRIMARY KEY,
        user_id      TEXT,
        resume_id    TEXT,
        title        TEXT,
        content      TEXT,
        type         TEXT,
        job_position TEXT,
        created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE SET NULL
    )
    """,
    # ============================================================
    # 4. Jobs & matches
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS job_posting
    (
        id              TEXT PRIMARY KEY,
        company_id      TEXT NOT NULL,
        company_name    TEXT,
        job_title       TEXT,
        required_skills TEXT    DEFAULT '[]',
        is_active       INTEGER DEFAULT 1,
        created_at      TEXT    DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_matches
    (
        id              TEXT PRIMARY KEY,
        user_id         TEXT,
        job_id          TEXT,
        resume_id       TEXT,
        cover_letter_id TEXT,
        match_score     REAL NOT NULL,
        status          TEXT DEFAULT 'matched',
        created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES job_posting (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE SET NULL,
        FOREIGN KEY (cover_letter_id) REFERENCES cover_letters (id) ON DELETE SET NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_invitations
    (
        id           TEXT PRIMARY KEY,
        job_id       TEXT,
        candidate_id TEXT,
        status       TEXT DEFAULT 'pending',
        created_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (job_id) REFERENCES job_posting (id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES user_profiles (id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 5. AI analysis tables
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS market_insights_cache
    (
        id           TEXT PRIMARY KEY,
        job_title    TEXT NOT NULL DEFAULT '',
        company_name TEXT,
        search_query TEXT UNIQUE,
        raw_scraps   TEXT,
        key_skills   TEXT          DEFAULT '[]',
        last_updated TEXT          DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS resume_feedback
    (
        id                      TEXT PRIMARY KEY,
        user_id                 TEXT NOT NULL,
        resume_id               TEXT NOT NULL,
        overall_score           INTEGER CHECK (overall_score IS NULL OR
                                               (overall_score >= 0 AND overall_score <= 100)),
        content_score           INTEGER,
        formatting_score        INTEGER,
        ats_compatibility_score INTEGER,
        suggestions             TEXT,
        critical_fixes          TEXT,
        learning_path           TEXT,
        skill_gaps              TEXT,
        experience_score        INTEGER CHECK (experience_score IS NULL OR
                                               (experience_score >= 0 AND
                                                experience_score <= 100)),
        education_score         INTEGER CHECK (education_score IS NULL OR
                                               (education_score >= 0 AND education_score <= 100)),
        technical_skills_score  INTEGER CHECK (technical_skills_score IS NULL OR
                                               (technical_skills_score >=
                                                0 AND
                                                technical_skills_score <=
                                                100)),
        soft_skills_score       INTEGER CHECK (soft_skills_score IS NULL OR
                                               (soft_skills_score >= 0 AND
                                                soft_skills_score <= 100)),
        achievements_score      INTEGER CHECK (achievements_score IS NULL OR
                                               (achievements_score >= 0 AND
                                                achievements_score <=
                                                100)),
        keywords_score          INTEGER CHECK (keywords_score IS NULL OR
                                               (keywords_score >= 0 AND keywords_score <= 100)),
        job_relevance_score     INTEGER CHECK (job_relevance_score IS NULL OR
                                               (job_relevance_score >=
                                                0 AND
                                                job_relevance_score <=
                                                100)),
        dimensions              TEXT,
        created_at              TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS competitor_profiles
    (
        id              TEXT PRIMARY KEY,
        job_analysis_id TEXT,
        source          TEXT,
        extracted_data  TEXT,
        created_at      TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS job_analysis
    (
        id                     TEXT PRIMARY KEY,
        user_id                TEXT,
        resume_id              TEXT,
        output_score           INTEGER,
        top_missing_skills     TEXT,
        top_advice             TEXT,
        competitor_profiles_id TEXT,
        created_at             TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE,
        FOREIGN KEY (competitor_profiles_id) REFERENCES competitor_profiles (id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS analysis_metrics
    (
        id              TEXT PRIMARY KEY,
        job_analysis_id TEXT,
        metric_name     TEXT,
        user_score      REAL,
        benchmark_score REAL,
        FOREIGN KEY (job_analysis_id) REFERENCES job_analysis (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS user_analysis_history
    (
        id                 TEXT PRIMARY KEY,
        user_id            TEXT,
        resume_id          TEXT,
        match_score        INTEGER,
        skill_gap_analysis TEXT,
        cv_embedding_id    TEXT,
        created_at         TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (resume_id) REFERENCES resumes (id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 6. Courses (skill-gap recommendations)
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS courses
    (
        id             TEXT PRIMARY KEY,
        title          TEXT,
        skill_category TEXT,
        affiliate_link TEXT,
        discount_code  TEXT DEFAULT 'RESUME10'
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS course_usage
    (
        id        TEXT PRIMARY KEY,
        user_id   TEXT,
        course_id TEXT,
        used_at   TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    )
    """,
    # ============================================================
    # 7. Subscriptions & payments (Stripe stub + PayPal additions)
    # ============================================================
    """
    CREATE TABLE IF NOT EXISTS subscriptions
    (
        id                     TEXT PRIMARY KEY,
        user_id                TEXT UNIQUE,
        plan                   TEXT NOT NULL,
        status                 TEXT NOT NULL,
        price                  REAL,
        start_date             TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        end_date               TEXT,
        paypal_subscription_id TEXT UNIQUE,
        paypal_plan_id         TEXT,
        cancel_at              TEXT,
        last_payment_at        TEXT,
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS payments
    (
        id                       TEXT PRIMARY KEY,
        subscription_id          TEXT,
        user_id                  TEXT,
        amount                   REAL NOT NULL,
        currency                 TEXT DEFAULT 'USD',
        stripe_payment_intent_id TEXT UNIQUE,
        paypal_order_id          TEXT UNIQUE,
        paypal_subscription_id   TEXT,
        paypal_capture_id        TEXT,
        provider                 TEXT DEFAULT 'paypal',
        status                   TEXT NOT NULL,
        created_at               TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES auth_users (id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS paypal_webhooks
    (
        id           TEXT PRIMARY KEY,
        event_id     TEXT NOT NULL UNIQUE,
        event_type   TEXT NOT NULL,
        payload      TEXT NOT NULL,
        processed_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        status       TEXT DEFAULT 'received'
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS contact_messages
    (
        id              TEXT PRIMARY KEY,
        name            TEXT,
        email           TEXT,
        subject         TEXT,
        body            TEXT NOT NULL,
        recipient       TEXT NOT NULL DEFAULT 'endrilika18@yahoo.com',
        delivery_status TEXT NOT NULL DEFAULT 'pending',
        delivery_error  TEXT,
        created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
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
]

# JSON columns: when reading these from a row, decode TEXT -> dict/list;
# when writing, encode dict/list -> TEXT.
JSON_COLUMNS = {
    "auth_users": {"raw_user_meta_data"},
    "resumes": {"raw_content", "polished_content", "ai_market_insights",
                "ai_learning_recommendations"},
    "templates": {"style_config"},
    "resume_feedback": {"suggestions", "critical_fixes", "learning_path",
                        "skill_gaps", "dimensions"},
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
            [{"idx": 0, "id": "0e7d244d-9583-48b6-88c6-058c3ba40f1c",
              "name": "Template 10", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/sign/resume-template-previews/template10.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Yjc3NTRmMy1iNGNhLTQ4MjAtODM4My1jYjM5NDEwY2NmNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXN1bWUtdGVtcGxhdGUtcHJldmlld3MvdGVtcGxhdGUxMC5qcGciLCJpYXQiOjE3Nzg4NjA0NDksImV4cCI6MTgxMDM5NjQ0OX0.6Nt24uJ6ksKxOFlADnbr-zYzDcG94D2znHVZB5u0Mm8",
              "style_config": "{\"layout\": \"pink-sidebar\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template10\", \"primaryColor\": \"#d84d9b\", \"sectionStyle\": \"divider\", \"sidebarColor\": \"#ffffff\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_pink"},

             {"idx": 1, "id": "17c5b000-8cbf-4281-8b29-f135eee1ccd0",
              "name": "Template 6", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template6.jpg",
              "style_config": "{\"layout\": \"top-header\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template6\", \"primaryColor\": \"#0b84c6\", \"sectionStyle\": \"light-divider\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_blue"},

             {"idx": 2, "id": "4a3dcfd6-d2c8-4b84-a5b3-78ea48a3a7bb",
              "name": "Template 4", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template4.jpg",
              "style_config": "{\"layout\": \"minimal-modern\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template4\", \"primaryColor\": \"#5a4df0\", \"sectionStyle\": \"underline\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "programming"},

             {"idx": 3, "id": "5894aadc-04d9-4d5d-9f7c-8384d18c4176",
              "name": "Template 11", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/sign/resume-template-previews/template11.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Yjc3NTRmMy1iNGNhLTQ4MjAtODM4My1jYjM5NDEwY2NmNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXN1bWUtdGVtcGxhdGUtcHJldmlld3MvdGVtcGxhdGUxMS5qcGciLCJpYXQiOjE3Nzg4NjA0ODMsImV4cCI6MTgxMDM5NjQ4M30._7dT9hc3-2BtVtCx2AafiBBFC7G_TgHMKfYz0ZMhUQ8",
              "style_config": "{\"layout\": \"left-sidebar\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template11\", \"primaryColor\": \"#5f17b5\", \"sectionStyle\": \"divider\", \"sidebarColor\": \"#d9c8eb\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_purple"},

             {"idx": 4, "id": "5911bb16-9751-4425-b711-dd27a36f0dbe",
              "name": "Template 12", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/sign/resume-template-previews/template12.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Yjc3NTRmMy1iNGNhLTQ4MjAtODM4My1jYjM5NDEwY2NmNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXN1bWUtdGVtcGxhdGUtcHJldmlld3MvdGVtcGxhdGUxMi5qcGciLCJpYXQiOjE3Nzg4NjA0OTIsImV4cCI6MTgxMDM5NjQ5Mn0.wbccldIYGHqRmmcRoWBKeaCXcsTEksmypLdDVXSsrC8",
              "style_config": "{\"layout\": \"minimal-sidebar\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template12\", \"primaryColor\": \"#4f6d73\", \"sectionStyle\": \"divider\", \"sidebarColor\": \"#dfe7e8\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_light"},

             {"idx": 5, "id": "5c23e50f-54cb-4aa2-aab3-1d561e6a2439",
              "name": "Template 3", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template3.jpg",
              "style_config": "{\"layout\": \"cards\", \"fontFamily\": \"Inter\", \"templateKey\": \"template3\", \"primaryColor\": \"#2f4f4f\", \"sectionStyle\": \"rounded\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "bubbly_programming"},

             {"idx": 6, "id": "667df3de-a8d7-4b9b-9894-032942a12929",
              "name": "Template 8", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template8.jpg",
              "style_config": "{\"layout\": \"green-sidebar\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template8\", \"primaryColor\": \"#13795b\", \"sectionStyle\": \"divider\", \"sidebarColor\": \"#13795b\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_green"},

             {"idx": 7, "id": "670ddf43-4173-4747-9d1b-44c349310358",
              "name": "Template 7", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template7.jpg",
              "style_config": "{\"layout\": \"classic-two-column\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template7\", \"primaryColor\": \"#333333\", \"sectionStyle\": \"divider\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "plain_white"},

             {"idx": 8, "id": "a4c31371-b741-440f-8cb9-a2fe4c35a2fc",
              "name": "Template 9", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/public/resume-template-previews/template9.jpg",
              "style_config": "{\"layout\": \"developer-sidebar\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template9\", \"primaryColor\": \"#1177b6\", \"sectionStyle\": \"accent-bar\", \"sidebarColor\": \"#c9dde7\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "light_blue"},

             {"idx": 9, "id": "bdca9933-3be8-4d41-b98f-374820c5c0ca",
              "name": "Template 5", "type": "minimalistic",
              "preview_image_url": "https://ujykomvgplbvgegptczf.supabase.co/storage/v1/object/sign/resume-template-previews/template7.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84Yjc3NTRmMy1iNGNhLTQ4MjAtODM4My1jYjM5NDEwY2NmNjQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXN1bWUtdGVtcGxhdGUtcHJldmlld3MvdGVtcGxhdGU3LmpwZyIsImlhdCI6MTc3ODg2MDU4OSwiZXhwIjoxODEwMzk2NTg5fQ.zdwWMQJEbcLjQzvOuVqmEl6Uz1TdVsKkweQnxNJg92w",
              "style_config": "{\"layout\": \"minimal-clean\", \"fontFamily\": \"Georgia\", \"templateKey\": \"template5\", \"primaryColor\": \"#444444\", \"sectionStyle\": \"thin-divider\"}",
              "is_premium": false,
              "created_at": "2026-05-15 10:53:04.087563+00",
              "template_key": "simple_white"}
             ]
        ],
    ),
    (
        "courses",
        [
            {"title": "Python for Data Science",
             "skill_category": "python",
             "affiliate_link": "https://www.coursera.org/learn/python"},
            {"title": "Advanced React Patterns", "skill_category": "react",
             "affiliate_link": "https://www.coursera.org/learn/react"},
            {"title": "AWS Cloud Practitioner Essentials",
             "skill_category": "aws",
             "affiliate_link": "https://www.aws.training/"},
            {"title": "SQL for Data Analysis", "skill_category": "sql",
             "affiliate_link": "https://www.coursera.org/learn/sql"},
            {"title": "Machine Learning Foundations",
             "skill_category": "machine learning",
             "affiliate_link": "https://www.coursera.org/learn/machine-learning"},
            {"title": "Project Management Professional Prep",
             "skill_category": "project management",
             "affiliate_link": "https://www.coursera.org/learn/pmp"},
            {"title": "Effective Communication for Engineers",
             "skill_category": "communication",
             "affiliate_link": "https://www.coursera.org/learn/communication"},
        ],
    ),
]
