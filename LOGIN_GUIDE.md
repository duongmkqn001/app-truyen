# 🔐 Hướng dẫn Đăng nhập / Đăng ký

## 📄 Các trang xác thực

Ứng dụng có 2 trang xác thực:

### 1. **login.html** - Trang đăng nhập đơn giản
- **Mục đích**: Dành cho người dùng đã có tài khoản
- **Tính năng**:
  - Form đăng nhập đơn giản, gọn gàng
  - Giao diện hiện đại với gradient background
  - Tự động chuyển hướng sau khi đăng nhập thành công
  - Hỗ trợ redirect URL (ví dụ: `login.html?redirect=upload.html`)
  - Kiểm tra trạng thái đăng nhập (tự động chuyển hướng nếu đã đăng nhập)
  - Thông báo lỗi chi tiết và thân thiện
  - Link đến trang đăng ký cho người dùng mới
- **URL**: `login.html`

### 2. **auth.html** - Trang đăng nhập & đăng ký
- **Mục đích**: Trang đầy đủ với cả đăng nhập và đăng ký
- **Tính năng**:
  - Tab chuyển đổi giữa đăng nhập và đăng ký
  - Form đăng ký với xác nhận mật khẩu
  - Tạo tài khoản mới với username
  - Tất cả tính năng của login.html
- **URL**: `auth.html`

## 🔗 Liên kết trong ứng dụng

Các trang chính đã được cập nhật để sử dụng `login.html`:
- ✅ `index.html` - Trang chủ
- ✅ `author.html` - Trang tác giả
- ⚠️ Các trang khác vẫn có thể sử dụng `auth.html`

## 🚀 Cách sử dụng

### Đăng nhập cơ bản:
```
login.html
```

### Đăng nhập với redirect:
```
login.html?redirect=upload.html
```
Sau khi đăng nhập thành công, người dùng sẽ được chuyển đến `upload.html`

### Đăng ký tài khoản mới:
```
auth.html
```
Hoặc click vào link "Đăng ký ngay" trong trang `login.html`

## 🎨 Thiết kế

### login.html
- Giao diện tối giản, tập trung vào form đăng nhập
- Icon lớn ở đầu trang (📚)
- Gradient background xanh lá
- Centered layout với max-width 28rem
- Loading spinner khi đang xử lý
- Thông báo lỗi/thành công với icon

### auth.html
- Giao diện đầy đủ với tab switcher
- Form đăng nhập và đăng ký trong cùng một trang
- Compact layout phù hợp cho cả mobile và desktop

## 🔧 Tính năng kỹ thuật

### Xác thực
- Sử dụng Supabase Authentication
- Email + Password authentication
- Kiểm tra tài khoản bị khóa (banned)
- Kiểm tra email confirmation

### Bảo mật
- Password tối thiểu 6 ký tự
- Xác nhận mật khẩu khi đăng ký
- Auto-logout khi tài khoản bị khóa
- Session management qua Supabase

### UX/UI
- Auto-focus vào email input
- Loading state với spinner
- Thông báo lỗi thân thiện
- Tự động redirect sau login thành công
- Remember me checkbox (UI only - chức năng có thể mở rộng)

## 📝 Ghi chú

- Cả hai trang đều hoạt động với file:// protocol
- Không cần server để chạy
- Dữ liệu xác thực được lưu trong Supabase
- Session được quản lý bởi Supabase client

## 🔄 Luồng đăng nhập

1. User truy cập `login.html`
2. Nhập email và password
3. Click "Đăng nhập"
4. Hệ thống kiểm tra credentials với Supabase
5. Nếu thành công:
   - Kiểm tra tài khoản có bị khóa không
   - Hiển thị thông báo thành công
   - Redirect về trang chủ hoặc URL được chỉ định
6. Nếu thất bại:
   - Hiển thị thông báo lỗi chi tiết
   - User có thể thử lại

## 🔄 Luồng đăng ký

1. User truy cập `auth.html`
2. Click tab "Đăng ký"
3. Nhập username, email, password, confirm password
4. Click "Đăng ký"
5. Hệ thống tạo tài khoản trong Supabase
6. Nếu thành công:
   - Hiển thị thông báo kiểm tra email
   - Tự động chuyển sang tab đăng nhập sau 3 giây
7. Nếu thất bại:
   - Hiển thị thông báo lỗi
   - User có thể thử lại

## 🎯 Khuyến nghị

- Sử dụng `login.html` cho các link "Đăng nhập" trong ứng dụng
- Sử dụng `auth.html` cho các link "Đăng ký" hoặc trang đầy đủ
- Thêm redirect parameter khi cần chuyển hướng sau login
- Giữ cả hai trang để linh hoạt trong việc sử dụng

