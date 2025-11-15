-- =====================================================
-- MIGRATION 006: SEED BL-FOCUSED TAGS
-- =====================================================
-- This migration populates the tags table with BL-focused tags from WikiDich
-- Based on clone.html tag system
-- Excludes: Ngôn tình (heterosexual romance) and Bách hợp (GL) specific tags
-- Total: 550+ unique tags organized by categories

-- Create index on tag name for faster searches
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- =====================================================
-- TÌNH TRẠNG (Status)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Hoàn thành', '#10B981'),
    ('Còn tiếp', '#3B82F6'),
    ('Tạm ngưng', '#F59E0B'),
    ('Chưa xác minh', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- TÍNH CHẤT (Nature)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Nguyên sang', '#8B5CF6'),
    ('Diễn sinh', '#6366F1')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- GIỚI TÍNH (Gender/Orientation)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Nam sinh', '#3B82F6'),
    ('Đam mỹ', '#F43F5E'),
    ('Không CP', '#6B7280'),
    ('Đa nguyên', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- THỜI ĐẠI (Era/Time Period)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Cổ đại', '#92400E'),
    ('Cận đại', '#A16207'),
    ('Hiện đại', '#0EA5E9'),
    ('Tương lai', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- KẾT THÚC (Ending Type)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('HE', '#10B981'),
    ('SE', '#F59E0B'),
    ('OE', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- LOẠI HÌNH (Genre/Type)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Tình cảm', '#EC4899'),
    ('Làm sự nghiệp', '#0891B2'),
    ('Tiên hiệp', '#8B5CF6'),
    ('Huyền huyễn', '#6366F1'),
    ('Khoa học viễn tưởng', '#06B6D4'),
    ('Mạt thế', '#78716C'),
    ('Sinh tồn', '#92400E'),
    ('Tranh bá', '#DC2626'),
    ('Võ hiệp', '#3B82F6'),
    ('Trinh thám', '#6366F1'),
    ('Kinh dị', '#7C2D12'),
    ('Quan trường', '#A16207'),
    ('Kinh thương', '#0891B2'),
    ('Quân sự', '#78716C'),
    ('Xây dựng', '#059669'),
    ('Làm ruộng', '#65A30D'),
    ('Huyền học', '#7C3AED'),
    ('Phim ảnh', '#DB2777'),
    ('Manga anime', '#F43F5E')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- THỊ GIÁC TÁC PHẨM (Perspective)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Thị giác nam chủ', '#3B82F6'),
    ('Chủ công', '#F43F5E'),
    ('Chủ thụ', '#A855F7'),
    ('Ngôi thứ nhất', '#6366F1'),
    ('Ngôi thứ hai', '#8B5CF6'),
    ('Xem ảnh thể', '#0EA5E9'),
    ('Diễn đàn thể', '#06B6D4'),
    ('Đối thoại thể', '#14B8A6'),
    ('Đa thị giác', '#10B981'),
    ('Song thị giác', '#84CC16')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ĐÁNH GIÁ (Awards/Ratings)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Kim Bảng 🏆', '#F59E0B'),
    ('Kim bài đề cử 🥇', '#FBBF24'),
    ('Ngân bài đề cử 🥈', '#D1D5DB'),
    ('Liên Thành 3 sao', '#3B82F6'),
    ('Liên Thành 4 sao', '#6366F1'),
    ('Liên Thành 5 sao', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- BỐI CẢNH THẾ GIỚI (World Setting)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Hồng hoang', '#92400E'),
    ('Dị thế', '#7C3AED'),
    ('Thú nhân', '#A16207'),
    ('Tinh tế', '#06B6D4'),
    ('Nam nam thế giới', '#F43F5E'),
    ('Thế giới song song', '#6366F1'),
    ('Nguyên thủy', '#78716C'),
    ('Cyberpunk', '#0EA5E9'),
    ('Steampunk', '#A16207'),
    ('Phế thổ', '#78716C'),
    ('Cao võ thế giới', '#DC2626'),
    ('Trò chơi xâm lấn', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- HỆ THỐNG NĂNG LƯỢNG (Power System)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Tây huyễn', '#8B5CF6'),
    ('Linh khí sống lại', '#10B981'),
    ('Linh dị thần quái', '#7C2D12'),
    ('Quy tắc quái đàm', '#7C2D12'),
    ('Tu chân', '#8B5CF6'),
    ('Ma pháp', '#7C3AED'),
    ('Đấu khí', '#DC2626'),
    ('Tiến hóa', '#059669'),
    ('Dị năng', '#6366F1'),
    ('Vu cổ', '#92400E'),
    ('Thần tiên yêu quái', '#A855F7'),
    ('Vampire', '#7C2D12'),
    ('Thần thoại', '#8B5CF6'),
    ('Cthulhu', '#7C2D12')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- BỐI CẢNH XÃ HỘI (Social Setting)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Đô thị tình duyên', '#EC4899'),
    ('Hào môn thế gia', '#F59E0B'),
    ('Cung đình hầu tước', '#92400E'),
    ('Tam giáo cửu lưu', '#78716C'),
    ('Hắc bang', '#1F2937'),
    ('Quân giáo', '#78716C'),
    ('Vườn trường', '#10B981'),
    ('Chức trường', '#0891B2'),
    ('Giang hồ ân oán', '#DC2626'),
    ('Phương Tây', '#A16207'),
    ('Niên đại văn', '#92400E'),
    ('Truyện cổ tích', '#A855F7'),
    ('Tĩnh Khang chi sỉ', '#92400E'),
    ('Thiên tai', '#EF4444'),
    ('Đệ tứ thiên tai', '#DC2626'),
    ('Lưu đày', '#78716C'),
    ('Chạy nạn', '#EF4444'),
    ('Lịch sử', '#92400E'),
    ('Giả tưởng lịch sử', '#A16207'),
    ('Hồng Kông', '#DC2626'),
    ('Học viện quý tộc', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- NGHỀ NGHIỆP & KỸ NĂNG (Profession & Skills)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Khoa cử', '#92400E'),
    ('Làm giàu', '#F59E0B'),
    ('Mỹ thực', '#EA580C'),
    ('Cơ giáp', '#78716C'),
    ('Đổ thạch', '#059669'),
    ('Phong thủy', '#7C3AED'),
    ('Trộm mộ', '#78716C'),
    ('Giám bảo', '#F59E0B'),
    ('Phá án', '#6366F1'),
    ('Y thuật', '#10B981'),
    ('Giới giải trí', '#EC4899'),
    ('Giới giải trí Nhật', '#F43F5E'),
    ('Giới giải trí Hàn', '#A855F7'),
    ('Giới giải trí Mỹ', '#3B82F6'),
    ('Japanese novel', '#F43F5E'),
    ('Korean novel', '#A855F7'),
    ('EU novel', '#3B82F6'),
    ('Võng phối', '#0EA5E9'),
    ('Phát sóng trực tiếp', '#EC4899'),
    ('Võng hồng', '#F43F5E'),
    ('Viết văn', '#6366F1'),
    ('Chế tác', '#78716C'),
    ('Võng du', '#06B6D4'),
    ('Trò chơi', '#8B5CF6'),
    ('Thẻ bài', '#F59E0B'),
    ('Ngự thú', '#65A30D'),
    ('Thực tế ảo', '#06B6D4'),
    ('Lữ hành', '#10B981'),
    ('Mạo hiểm', '#DC2626'),
    ('Dưỡng oa', '#EC4899'),
    ('Tổng nghệ', '#F43F5E'),
    ('Oa tổng', '#A855F7'),
    ('Luyến tổng', '#EC4899'),
    ('Giới thời trang', '#DB2777'),
    ('Giải mật', '#6366F1'),
    ('Nghiên cứu khoa học', '#06B6D4'),
    ('Thể thao', '#DC2626'),
    ('Thi đấu cạnh kỹ', '#EF4444'),
    ('Cổ võ', '#92400E')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- XUYÊN KHÔNG & TRỌNG SINH (Time Travel & Rebirth)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Thai xuyên', '#A855F7'),
    ('Thân xuyên', '#9333EA'),
    ('Xuyên việt', '#7C3AED'),
    ('Xuyên thư', '#6D28D9'),
    ('Xuyên game', '#5B21B6'),
    ('Xuyên nhanh', '#4C1D95'),
    ('Xuyên chậm', '#A855F7'),
    ('Cổ xuyên kim', '#9333EA'),
    ('Cổ đại xuyên tươg lai', '#7C3AED'),
    ('Tg lai xuyên hiện đại', '#6D28D9'),
    ('Tg lai xuyên cổ đại', '#5B21B6'),
    ('Đàn xuyên', '#A855F7'),
    ('Song xuyên', '#9333EA'),
    ('Xuyên về thế giới cũ', '#7C3AED'),
    ('Trọng sinh', '#EC4899'),
    ('Song trọng sinh', '#DB2777'),
    ('Chết đi sống lại', '#BE185D'),
    ('Hoán đổi linh hồn', '#A855F7'),
    ('Qua lại thời không', '#9333EA'),
    ('Vị diện', '#7C3AED')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- THỜI ĐẠI LỊCH SỬ (Historical Periods)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Thời Xuân Thu', '#92400E'),
    ('Thời Chiến Quốc', '#A16207'),
    ('Đại Tần', '#78350F'),
    ('Đại Hán', '#92400E'),
    ('Đại Đường', '#A16207'),
    ('Đại Tống', '#78350F'),
    ('Đại Minh', '#92400E'),
    ('Đại Thanh', '#A16207'),
    ('Dân quốc', '#78350F')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- HỆ THỐNG & NĂNG LỰC ĐẶC BIỆT (System & Special Abilities)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Vô hệ thống', '#6B7280'),
    ('Vô bàn tay vàng', '#78716C'),
    ('Nộp bàn tay vàng', '#F59E0B'),
    ('Hệ thống', '#8B5CF6'),
    ('Song hệ thống', '#6366F1'),
    ('Thương thành', '#0891B2'),
    ('Rút thăm trúng thưởng', '#F59E0B'),
    ('Tùy thân không gian', '#7C3AED'),
    ('Linh tuyền', '#10B981'),
    ('Tool mô phỏng', '#06B6D4'),
    ('Hợp thành', '#8B5CF6'),
    ('App', '#3B82F6'),
    ('Group chat', '#EC4899'),
    ('Cẩm lý thể chất', '#A855F7'),
    ('Thấu thị', '#6366F1'),
    ('Thôi miên', '#7C3AED'),
    ('Đọc tâm', '#8B5CF6'),
    ('Ngôn linh', '#A855F7'),
    ('Đánh dấu', '#F59E0B'),
    ('Đọc đương', '#6366F1'),
    ('Hồi đương', '#10B981'),
    ('Vô hiệu hóa', '#6B7280'),
    ('Kịch thấu', '#8B5CF6'),
    ('Tiên tri', '#A855F7'),
    ('Ngộ tính', '#6366F1'),
    ('Làn đạn', '#DC2626'),
    ('Tùy thân gia gia', '#EC4899'),
    ('Nghe hiểu động vật', '#65A30D'),
    ('Nghe hiểu thực vật', '#059669'),
    ('Duy ngã độc pháp', '#7C3AED')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- TÁC PHẨM NGUYÊN TÁC (Original Works - Fanfic Sources)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    -- Chinese Classics
    ('Tam Quốc', '#92400E'),
    ('Hồng Lâu', '#EC4899'),
    ('Tây Du', '#F59E0B'),
    ('Thủy Hử', '#3B82F6'),
    ('Bảng Phong Thần', '#8B5CF6'),
    ('Liêu trai', '#7C2D12'),
    ('Thất hiệp ngũ nghĩa', '#92400E'),
    ('Kim Dung', '#A16207'),
    ('Cổ Long', '#78716C'),
    ('Quỳnh Dao', '#EC4899'),
    ('Đấu La đại lục', '#8B5CF6'),
    ('Đấu phá thương khung', '#6366F1'),
    ('Quỷ bí ch chủ', '#7C2D12'),
    ('Thần ấn vương toạ', '#F59E0B'),
    ('Ma đạo tổ sư', '#F43F5E'),
    ('Toàn chức cao thủ', '#0891B2'),
    ('Đạo mộ bút ký', '#78716C'),
    ('Nhất nhân chi hạ', '#DC2626'),
    ('Già Thiên', '#8B5CF6'),
    -- Anime/Manga
    ('Naruto', '#F59E0B'),
    ('One Piece', '#3B82F6'),
    ('Pokemon', '#FBBF24'),
    ('Digimon', '#06B6D4'),
    ('Hunter x Hunter', '#10B981'),
    ('Dragon Ball', '#F59E0B'),
    ('Bleach', '#1F2937'),
    ('Hoàng tử Tennis', '#10B981'),
    ('Inuyasha', '#EC4899'),
    ('Gintama', '#D1D5DB'),
    ('Fairy Tail', '#F43F5E'),
    ('Kuroko no basket', '#3B82F6'),
    ('JOJO', '#F59E0B'),
    ('Saiki', '#A855F7'),
    ('Đao kiếm loạn vũ', '#6366F1'),
    ('Hitman Reborn', '#F59E0B'),
    ('Attack on Titan', '#78716C'),
    ('Bungo Stray Dogs', '#1F2937'),
    ('XxxHolic', '#7C2D12'),
    ('My Hero Academia', '#10B981'),
    ('Kimetsu no Yaiba', '#DC2626'),
    ('Jujutsu Kaisen', '#1F2937'),
    ('K Project', '#3B82F6'),
    ('CC Sakura', '#EC4899'),
    ('Ouran Host Club', '#F43F5E'),
    ('Vampire Knight', '#7C2D12'),
    ('Yu-Gi-Oh!', '#8B5CF6'),
    ('Tokyo Ghoul', '#1F2937'),
    ('Tokyo Revengers', '#F59E0B'),
    ('Toriko', '#10B981'),
    ('Natsume Yuujinchou', '#65A30D'),
    ('Haikyuu!!', '#F59E0B'),
    ('One-Punch Man', '#FBBF24'),
    ('Blue Lock', '#3B82F6'),
    ('Captain Tsubasa', '#10B981'),
    ('Aoashi', '#059669'),
    ('Noragami', '#8B5CF6'),
    ('Conan', '#3B82F6'),
    ('Type-Moon', '#8B5CF6'),
    ('Chainsaw Man', '#DC2626'),
    ('Madoka Magica', '#EC4899'),
    ('Vua đầu bếp Soma', '#F59E0B'),
    ('Saint Seiya', '#F59E0B'),
    ('Shugo Chara!', '#EC4899'),
    ('Diamond no Ace', '#3B82F6'),
    ('Mob Psycho 100', '#8B5CF6'),
    ('Hanako-kun', '#F59E0B'),
    ('Fate', '#8B5CF6'),
    ('Saiunkoku Monogatari', '#EC4899'),
    ('Tomie', '#7C2D12'),
    -- Western Media
    ('Phim Anh Mỹ', '#3B82F6'),
    ('Trò chơi vương quyền', '#1F2937'),
    ('Siêu anh hùng', '#DC2626'),
    ('Marvel', '#DC2626'),
    ('DC', '#3B82F6'),
    ('Harry Potter', '#8B5CF6'),
    ('Sherlock Holmes', '#1F2937'),
    ('Criminal Minds', '#78716C'),
    ('Ultraman', '#DC2626'),
    ('Gundam', '#78716C'),
    -- Chinese Media
    ('Phích Lịch', '#1F2937'),
    ('Trảm Thần', '#DC2626'),
    ('Dragon Raja', '#8B5CF6'),
    ('Trần Tình Lệnh', '#F43F5E'),
    ('Lượng kiếm', '#3B82F6'),
    ('T.mãn cửu đạo loan', '#EC4899'),
    ('T.mãn tứ hợp viện', '#F59E0B'),
    ('Thiếu niên ca hành', '#8B5CF6'),
    ('Liên Hoa Lâu', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- TÍNH CÁCH NHÂN VẬT (Character Personality)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Bình tĩnh', '#6B7280'),
    ('Phật hệ', '#10B981'),
    ('Cá mặn', '#78716C'),
    ('Bình phàm', '#9CA3AF'),
    ('Ôn nhu', '#EC4899'),
    ('Dương quang', '#FBBF24'),
    ('Nhiệt liệt', '#DC2626'),
    ('Xã khủng', '#6B7280'),
    ('Xã ngưu', '#78716C'),
    ('Xã súc', '#9CA3AF'),
    ('Sa điêu', '#F43F5E'),
    ('Trung nhị', '#3B82F6'),
    ('Cố chấp', '#DC2626'),
    ('Điên phê', '#EF4444'),
    ('Hắc hóa', '#1F2937'),
    ('Ẩm thấp', '#78716C'),
    ('Bệnh kiều', '#7C2D12'),
    ('Ngạo kiều', '#F59E0B'),
    ('Thiên chi kiêu tử', '#F59E0B'),
    ('Biệt nữu', '#EC4899'),
    ('Trung khuyển', '#A16207'),
    ('Chó săn', '#78716C'),
    ('Liếm cẩu', '#6B7280'),
    ('Muộn tao', '#1F2937'),
    ('Tâm cơ', '#8B5CF6'),
    ('Cực phẩm', '#F59E0B'),
    ('Trà xanh', '#10B981'),
    ('Bạch liên hoa', '#F5F5F5'),
    ('Hắc liên hoa', '#1F2937'),
    ('Thố ti hoa', '#EC4899'),
    ('Làm tinh', '#F59E0B'),
    ('Diễn tinh', '#8B5CF6'),
    ('Câu hệ', '#3B82F6'),
    ('Cha hệ', '#78716C'),
    ('Cấm dục', '#6B7280'),
    ('Thanh lãnh', '#06B6D4'),
    ('Cao lãnh chi hoa', '#D1D5DB'),
    ('Băng sơn', '#93C5FD'),
    ('Si tình', '#EC4899'),
    ('Vô tình', '#6B7280'),
    ('Phong lưu', '#F43F5E'),
    ('Hải vương', '#3B82F6'),
    ('Ngựa giống', '#A16207'),
    ('Dấm vương', '#F59E0B'),
    ('Chiếm hữu dục', '#DC2626'),
    ('Biến thái', '#7C2D12'),
    ('Si hán', '#78716C'),
    ('Tháo hán', '#F59E0B'),
    ('Nhân phu', '#78716C'),
    ('Nhân thê', '#EC4899'),
    ('Nam mụ mụ', '#3B82F6'),
    ('Tàn tật', '#78716C'),
    ('Khuyết tật', '#6B7280'),
    ('Cắt miếng', '#1F2937'),
    ('Đa nhân cách', '#8B5CF6'),
    ('Mất trí nhớ', '#6B7280'),
    ('OOC', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- PHONG CÁCH & NỘI DUNG (Style & Content)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Chủ cốt truyện', '#8B5CF6'),
    ('Thuần thịt', '#DC2626'),
    ('Ngọt sủng', '#EC4899'),
    ('Nhẹ nhàng', '#10B981'),
    ('Ấm áp', '#F59E0B'),
    ('Chữa lành', '#10B981'),
    ('Hài hước', '#FBBF24'),
    ('Nhiệt huyết', '#DC2626'),
    ('Hằng ngày', '#6B7280'),
    ('Chậm nhiệt', '#78716C'),
    ('Tế thuỷ trường lưu', '#3B82F6'),
    ('Bình dân sinh hoạt', '#9CA3AF'),
    ('Thời xưa phong', '#92400E'),
    ('Lôi', '#DC2626'),
    ('Tam quan bất chính', '#7C2D12'),
    ('Sang phi tất cả', '#F59E0B'),
    ('Cẩu huyết', '#DC2626'),
    ('Văn nghệ', '#8B5CF6'),
    ('Chính kịch', '#1F2937'),
    ('Hiện thực', '#6B7280'),
    ('Ngược luyến', '#7C2D12'),
    ('Hắc ám', '#1F2937'),
    ('Sảng văn', '#10B981'),
    ('Đoản văn', '#6B7280'),
    ('Quân văn', '#78716C'),
    ('Tiểu bạch văn', '#D1D5DB'),
    ('Thanh thủy văn', '#93C5FD'),
    ('Đơn nguyên văn', '#6B7280'),
    ('Quốc lộ văn', '#78716C'),
    ('Ăn dưa văn', '#10B981'),
    ('Quần tượng văn', '#8B5CF6'),
    ('Mua cổ văn', '#F59E0B'),
    ('Otome', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CỐT TRUYỆN (Plot Elements)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Phản sát hệ thống', '#DC2626'),
    ('Phản kịch bản', '#EF4444'),
    ('Phản bàn tay vàng', '#F59E0B'),
    ('Phản anh hùng', '#7C2D12'),
    ('Báo thù', '#DC2626'),
    ('Ngược tra', '#7C2D12'),
    ('Cung đấu', '#92400E'),
    ('Trạch đấu', '#A16207'),
    ('Quyền mưu', '#78716C'),
    ('Cải trang giả dạng', '#8B5CF6'),
    ('Bình bộ thanh vân', '#10B981'),
    ('Trưởng thành', '#6B7280'),
    ('Dốc lòng', '#DC2626'),
    ('Nghịch tập', '#EF4444'),
    ('Vả mặt', '#F59E0B'),
    ('Vô hạn lưu', '#8B5CF6'),
    ('Thăng cấp lưu', '#10B981'),
    ('Vô địch lưu', '#F59E0B'),
    ('Phế sài lưu', '#78716C'),
    ('Kỹ thuật lưu', '#06B6D4'),
    ('Phàm nhân lưu', '#6B7280'),
    ('Cao nhân lưu', '#F59E0B'),
    ('Sáng thế lưu', '#8B5CF6'),
    ('Cứu thế lưu', '#10B981'),
    ('Hắc thủ lưu', '#1F2937'),
    ('Áo choàng lưu', '#8B5CF6'),
    ('Đoàn đội lưu', '#3B82F6'),
    ('Toàn dân lưu', '#6B7280'),
    ('Triệu hoán lưu', '#A855F7'),
    ('Thần hào lưu', '#F59E0B'),
    ('Công lược nhiệm vụ', '#8B5CF6'),
    ('Hoa Hạ cực đoan', '#DC2626')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- QUAN HỆ TÌNH CẢM (Relationships)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Ăn nhờ ở đậu', '#6B7280'),
    ('Thanh mai trúc mã', '#10B981'),
    ('Hoan hỉ oan gia', '#F59E0B'),
    ('Song hướng yêu thầm', '#EC4899'),
    ('Đơn hướng yêu thầm', '#DB2777'),
    ('Nhất kiến chung tình', '#EC4899'),
    ('Tình hữu độc chung', '#DC2626'),
    ('Mất mà tìm lại', '#10B981'),
    ('Gương vỡ lại lành', '#10B981'),
    ('Gương vỡ không lành', '#7C2D12'),
    ('Cưới trước yêu sau', '#EC4899'),
    ('Bầu trước yêu sau', '#F59E0B'),
    ('Khế ước tình nhân', '#8B5CF6'),
    ('Từ giả thành thật', '#10B981'),
    ('Kiếp trước kiếp này', '#A855F7'),
    ('Cận thủy lâu đài', '#3B82F6'),
    ('Lâu ngày sinh tình', '#EC4899'),
    ('Lâu ngày gặp lại', '#10B981'),
    ('Duyên trời tác hợp', '#F59E0B'),
    ('Trâu già gặm cỏ non', '#78716C'),
    ('Tương ái tương sát', '#DC2626'),
    ('Chế phục tình duyên', '#F43F5E'),
    ('Cường thủ hào đoạt', '#DC2626'),
    ('Cưỡng chế ái', '#7C2D12'),
    ('Cầm tù', '#1F2937'),
    ('Bao dưỡng', '#F59E0B'),
    ('Dạy dỗ', '#78716C'),
    ('Từ hôn', '#6B7280'),
    ('Tái hôn', '#10B981'),
    ('Liên hôn', '#EC4899'),
    ('Thế gả', '#92400E'),
    ('Thế thân', '#A16207'),
    ('Song thế thân', '#8B5CF6'),
    ('Dưỡng thành', '#EC4899'),
    ('Cứu rỗi', '#10B981'),
    ('Khuê mật', '#EC4899'),
    ('Tình bạn', '#10B981'),
    ('Tình thân', '#F59E0B'),
    ('Tình địch', '#DC2626'),
    ('Đối thủ sống còn', '#EF4444'),
    ('Mang cầu chạy', '#EC4899'),
    ('Mang cầu không chạy', '#6B7280'),
    ('Hỏa táng tràng', '#DC2626'),
    ('Tu la tràng', '#EF4444'),
    ('Bạn cùng phòng', '#3B82F6'),
    ('Cấp trên cấp dưới', '#78716C'),
    ('Hạ khắc thượng', '#DC2626'),
    ('Cong bẻ thẳng', '#F43F5E'),
    ('Thẳng bẻ cong', '#A855F7'),
    ('Pháo hữu', '#DC2626'),
    ('SM', '#7C2D12'),
    ('NTR', '#DC2626'),
    ('PUA', '#7C2D12'),
    ('PTSD', '#78716C')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- LOẠI NHÂN VẬT BL (BL Character Types)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('Tra công tiện thụ', '#F43F5E'),
    ('Tra công tra thụ', '#DC2626'),
    ('Tra nam', '#DC2626'),
    ('Tiện nam', '#3B82F6'),
    ('Tra công', '#DC2626'),
    ('Tra thụ', '#F43F5E'),
    ('Tiện công', '#3B82F6'),
    ('Tiện thụ', '#A855F7'),
    ('Nhược công', '#93C5FD'),
    ('Nhược thụ', '#FCA5A5'),
    ('Mỹ công', '#EC4899'),
    ('Mỹ thụ', '#F43F5E'),
    ('Sửu công', '#78716C'),
    ('Sửu thụ', '#6B7280'),
    ('Sửu nam', '#78716C'),
    ('Tráng công', '#DC2626'),
    ('Tráng thụ', '#EF4444'),
    ('Có phản công', '#F59E0B'),
    ('Hỗ công', '#3B82F6'),
    ('Hỗ thụ', '#A855F7'),
    ('Tự công tự thụ', '#8B5CF6'),
    ('Tổng tài thụ', '#0891B2'),
    ('Kim chủ thụ', '#F59E0B'),
    ('Nam sủng công', '#EC4899'),
    ('Chim hoàng yến công', '#FBBF24'),
    ('Sư tôn công', '#92400E'),
    ('Niên thượng', '#78716C'),
    ('Niên hạ', '#10B981'),
    ('Cường cường', '#DC2626'),
    ('Mỹ cường', '#EC4899'),
    ('Cường nhược', '#F59E0B'),
    ('Nhược cường', '#10B981'),
    ('Nhược nhược', '#93C5FD')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- QUAN HỆ CP (CP Relationships)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('1v1', '#10B981'),
    ('Nhiều CP', '#F59E0B'),
    ('NP', '#DC2626'),
    ('L luân', '#7C2D12'),
    ('Phụ tử', '#7C2D12'),
    ('Huynh đệ', '#78716C'),
    ('Tỷ đệ', '#3B82F6'),
    ('Công tức', '#78716C'),
    ('Thúc chất', '#92400E'),
    ('Thúc tẩu', '#78716C'),
    ('Tỷ phu', '#92400E'),
    ('Kế phụ', '#78716C'),
    ('Sư đồ', '#92400E'),
    ('Chủ phó', '#78716C'),
    ('Song khiết 🕊️', '#10B981'),
    ('Phi song khiết 🌂', '#F59E0B'),
    ('NP toàn khiết 🕊️', '#10B981'),
    ('Thụ cao hơn công', '#F59E0B'),
    ('Thụ tráng hơn công', '#DC2626'),
    ('Công ysl', '#78716C'),
    ('Công dưa ko khiết', '#F59E0B'),
    ('Công cúc ko khiết', '#DC2626'),
    ('Thụ dưa ko khiết', '#F59E0B'),
    ('Thụ cúc ko khiết', '#DC2626'),
    ('Nam 9 ko khiết', '#F59E0B'),
    ('Giẻ lau', '#6B7280'),
    ('Đổi người yêu', '#F59E0B'),
    ('Đổi công', '#DC2626'),
    ('Đổi thụ', '#EC4899'),
    ('Thụ chuyển công', '#F59E0B'),
    ('Công chuyển thụ', '#EC4899'),
    ('Song chết', '#1F2937'),
    ('Thử Miêu CP', '#EC4899'),
    ('Ngẫu Bính CP', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ABO & SINH SẢN (ABO & Reproduction)
-- =====================================================
INSERT INTO tags (name, color) VALUES
    ('ABO', '#8B5CF6'),
    ('EABO', '#A855F7'),
    ('A x A', '#DC2626'),
    ('B x B', '#6B7280'),
    ('O x O', '#EC4899'),
    ('E x A', '#F59E0B'),
    ('E x B', '#10B981'),
    ('E x O', '#3B82F6'),
    ('A x B', '#F59E0B'),
    ('A x O', '#EC4899'),
    ('B x A', '#10B981'),
    ('B x O', '#3B82F6'),
    ('O x A', '#DC2626'),
    ('O x B', '#6B7280'),
    ('Thú x Người', '#78716C'),
    ('Công sinh con', '#F43F5E'),
    ('Sinh con', '#EC4899'),
    ('Song tính', '#8B5CF6'),
    ('Đơn tính', '#6B7280'),
    ('Song JJ', '#DC2626'),
    ('Sản nhũ', '#EC4899'),
    ('Lính gác dẫn đường', '#3B82F6'),
    ('Fork&Cake', '#EC4899'),
    ('Xúc tu', '#A855F7'),
    ('Trùng tộc', '#78716C')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION & SUMMARY
-- =====================================================
DO $$
DECLARE
    tag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tag_count FROM tags;
    RAISE NOTICE '✅ Migration 006 completed successfully!';
    RAISE NOTICE '📊 Total tags in database: %', tag_count;
    RAISE NOTICE '🏷️  BL-focused tags have been seeded (excludes Ngôn tình and Bách hợp).';
END $$;
