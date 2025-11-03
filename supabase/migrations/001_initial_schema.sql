-- =====================================================
-- SUPABASE DATABASE SCHEMA FOR VIETNAMESE NOVEL PLATFORM
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('reader', 'admin');
CREATE TYPE novel_status AS ENUM ('Hoàn thành', 'Đang ra', 'Tạm ngưng');
CREATE TYPE report_type AS ENUM ('comment', 'review', 'novel');
CREATE TYPE report_status AS ENUM ('pending', 'resolved', 'dismissed');

-- =====================================================
-- USERS TABLE (extends auth.users)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'reader' NOT NULL,
    is_banned BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TAGS TABLE
-- =====================================================

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT 'green', -- Tailwind color name for badge styling
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- NOVELS TABLE
-- =====================================================

CREATE TABLE novels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    editor_name TEXT,
    chapter_count INTEGER DEFAULT 0,
    summary TEXT,
    content TEXT, -- Full content or preview
    cover_image_url TEXT,
    novel_url TEXT, -- Link to read the full story
    editor_profile_url TEXT,
    status novel_status DEFAULT 'Đang ra' NOT NULL,
    is_approved BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_novels_status ON novels(status);
CREATE INDEX idx_novels_approved ON novels(is_approved);
CREATE INDEX idx_novels_created_at ON novels(created_at DESC);

-- =====================================================
-- NOVEL_TAGS TABLE (Many-to-Many Junction)
-- =====================================================

CREATE TABLE novel_tags (
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (novel_id, tag_id)
);

CREATE INDEX idx_novel_tags_novel ON novel_tags(novel_id);
CREATE INDEX idx_novel_tags_tag ON novel_tags(tag_id);

-- =====================================================
-- RATINGS TABLE
-- =====================================================

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating DECIMAL(2,1) CHECK (rating >= 1.0 AND rating <= 5.0) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(novel_id, user_id) -- One rating per user per novel
);

CREATE INDEX idx_ratings_novel ON ratings(novel_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_comments_novel ON comments(novel_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_flagged ON comments(is_flagged);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    review_text TEXT NOT NULL,
    is_flagged BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(novel_id, user_id) -- One review per user per novel
);

CREATE INDEX idx_reviews_novel ON reviews(novel_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_flagged ON reviews(is_flagged);

-- =====================================================
-- NOMINATIONS TABLE (Reader Votes)
-- =====================================================

CREATE TABLE nominations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id UUID REFERENCES novels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(novel_id, user_id) -- One nomination per user per novel
);

CREATE INDEX idx_nominations_novel ON nominations(novel_id);
CREATE INDEX idx_nominations_user ON nominations(user_id);

-- =====================================================
-- REPORTS TABLE
-- =====================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reported_by UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    report_type report_type NOT NULL,
    content_id UUID NOT NULL, -- ID of comment, review, or novel
    reason TEXT NOT NULL,
    status report_status DEFAULT 'pending' NOT NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_content ON reports(content_id);

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_novels_updated_at BEFORE UPDATE ON novels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for novels with aggregated ratings and nomination counts
CREATE OR REPLACE VIEW novels_with_stats AS
SELECT 
    n.*,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(DISTINCT r.id) as rating_count,
    COUNT(DISTINCT nom.id) as nomination_count,
    ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tag_names,
    ARRAY_AGG(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
FROM novels n
LEFT JOIN ratings r ON n.id = r.novel_id
LEFT JOIN nominations nom ON n.id = nom.novel_id
LEFT JOIN novel_tags nt ON n.id = nt.novel_id
LEFT JOIN tags t ON nt.tag_id = t.id
GROUP BY n.id;

-- =====================================================
-- SEED DATA - Insert default tags
-- =====================================================

INSERT INTO tags (name, color) VALUES
    ('Đam mỹ', 'purple'),
    ('Huyền huyễn', 'green'),
    ('Tiên hiệp', 'blue'),
    ('Võng du', 'yellow'),
    ('Cạnh kỹ', 'orange'),
    ('Dị giới', 'red'),
    ('Xuyên thư', 'pink'),
    ('Phàm nhân', 'indigo'),
    ('Đô thị', 'gray'),
    ('Lịch sử', 'amber'),
    ('Khoa huyễn', 'cyan'),
    ('Kinh dị', 'slate')
ON CONFLICT (name) DO NOTHING;

