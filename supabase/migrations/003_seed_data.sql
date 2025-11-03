-- =====================================================
-- SEED DATA - Migrate existing novels from JSON
-- =====================================================

-- Note: This assumes you'll create an admin user first through Supabase Auth
-- Replace 'ADMIN_USER_ID' with the actual UUID after creating the admin account

-- Insert sample novels (these will need approval by admin)
-- You can run this after setting up your first admin user

-- Example: Insert novels with proper data
-- Uncomment and modify after creating admin user

/*
INSERT INTO novels (
    title, 
    author_name, 
    editor_name, 
    chapter_count, 
    status, 
    is_approved,
    summary,
    created_by
) VALUES
(
    'Ma Đạo Tổ Sư',
    'Mặc Hương Đồng Khứu',
    'Hảo Hảo',
    113,
    'Hoàn thành',
    true,
    'Một câu chuyện về tu tiên và phiêu lưu đầy kịch tính...',
    'ADMIN_USER_ID'
),
(
    'Thiên Quan Tứ Phúc',
    'Mặc Hương Đồng Khứu',
    'Hảo Hảo',
    244,
    'Hoàn thành',
    true,
    'Thiên quan tứ phúc là một tiểu thuyết đam mỹ...',
    'ADMIN_USER_ID'
),
(
    'Toàn Chức Cao Thủ',
    'Hồ Điệp Lam',
    'Minh Minh',
    1728,
    'Hoàn thành',
    true,
    'Câu chuyện về game thủ chuyên nghiệp...',
    'ADMIN_USER_ID'
),
(
    'Đấu La Đại Lục',
    'Đường Gia Tam Thiếu',
    'Linh Linh',
    336,
    'Hoàn thành',
    true,
    'Thế giới võ hồn đầy màu sắc...',
    'ADMIN_USER_ID'
),
(
    'Hệ Thống Tự Cứu Của Nhân Vật Phản Diện',
    'Mặc Hương Đồng Khứu',
    'Hảo Hảo',
    81,
    'Hoàn thành',
    true,
    'Xuyên vào tiểu thuyết và trở thành nhân vật phản diện...',
    'ADMIN_USER_ID'
),
(
    'Phàm Nhân Tu Tiên',
    'Vong Ngữ',
    'Tuấn Tuấn',
    2400,
    'Đang ra',
    true,
    'Hành trình tu tiên của một phàm nhân...',
    'ADMIN_USER_ID'
);
*/

-- =====================================================
-- FUNCTION TO ASSIGN TAGS TO NOVELS
-- =====================================================

-- Helper function to link novels with tags
-- Usage: SELECT assign_novel_tags('novel_title', ARRAY['tag1', 'tag2']);

CREATE OR REPLACE FUNCTION assign_novel_tags(
    novel_title_param TEXT,
    tag_names_param TEXT[]
)
RETURNS VOID AS $$
DECLARE
    novel_id_var UUID;
    tag_name_var TEXT;
    tag_id_var INTEGER;
BEGIN
    -- Get novel ID
    SELECT id INTO novel_id_var
    FROM novels
    WHERE title = novel_title_param
    LIMIT 1;
    
    IF novel_id_var IS NULL THEN
        RAISE EXCEPTION 'Novel not found: %', novel_title_param;
    END IF;
    
    -- Loop through tags and assign them
    FOREACH tag_name_var IN ARRAY tag_names_param
    LOOP
        -- Get or create tag
        SELECT id INTO tag_id_var
        FROM tags
        WHERE name = tag_name_var;
        
        IF tag_id_var IS NULL THEN
            INSERT INTO tags (name) VALUES (tag_name_var)
            RETURNING id INTO tag_id_var;
        END IF;
        
        -- Assign tag to novel (ignore if already exists)
        INSERT INTO novel_tags (novel_id, tag_id)
        VALUES (novel_id_var, tag_id_var)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXAMPLE: Assign tags to novels
-- =====================================================

-- Uncomment after inserting novels above

/*
SELECT assign_novel_tags('Ma Đạo Tổ Sư', ARRAY['Đam mỹ', 'Huyền huyễn']);
SELECT assign_novel_tags('Thiên Quan Tứ Phúc', ARRAY['Đam mỹ', 'Tiên hiệp']);
SELECT assign_novel_tags('Toàn Chức Cao Thủ', ARRAY['Võng du', 'Cạnh kỹ']);
SELECT assign_novel_tags('Đấu La Đại Lục', ARRAY['Huyền huyễn', 'Dị giới']);
SELECT assign_novel_tags('Hệ Thống Tự Cứu Của Nhân Vật Phản Diện', ARRAY['Xuyên thư', 'Đam mỹ']);
SELECT assign_novel_tags('Phàm Nhân Tu Tiên', ARRAY['Tiên hiệp', 'Phàm nhân']);
*/

-- =====================================================
-- EXAMPLE: Insert sample ratings
-- =====================================================

-- Uncomment after creating user accounts

/*
-- Assuming you have user IDs, insert sample ratings
INSERT INTO ratings (novel_id, user_id, rating) VALUES
(
    (SELECT id FROM novels WHERE title = 'Ma Đạo Tổ Sư'),
    'USER_ID_1',
    4.9
),
(
    (SELECT id FROM novels WHERE title = 'Thiên Quan Tứ Phúc'),
    'USER_ID_1',
    4.8
);
*/

