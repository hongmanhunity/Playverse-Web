# PlayVerse — Digital Game Store & Admin Platform

Nền tảng khám phá trò chơi, đánh giá cộng đồng, bảng xếp hạng và quản trị hệ thống, xây dựng theo mô hình Full-Stack Monorepo (`server/` + `client/`).

- **Live Demo:** https://playverse.id.vn

## Công nghệ sử dụng

- **Frontend (`client/`):** React, Vite, Ant Design, React Router, Axios
- **Backend (`server/`):** Node.js, Express, MongoDB (Mongoose), JWT (Access & Refresh Token), Nodemailer / Resend API, Swagger UI
- **Triển khai:** Docker, Docker Compose, Nginx

## Tính năng chính

- **Kho game & Tương tác:** Tìm kiếm, lọc theo thể loại, sắp xếp, xem chi tiết game, lưu Wishlist, đánh giá sao và bình luận.
- **Xác thực & Bảo mật:** Đăng ký xác thực OTP qua Email, Quên/Đổi mật khẩu, Google OAuth, Dual-Token JWT kèm Token Rotation, Helmet, CORS whitelist và Rate Limiting.
- **Cộng đồng & Bảng xếp hạng:** Đăng bài thảo luận, thích/bình luận bài viết và BXH điểm toàn hệ thống hoặc theo từng game.
- **Trang quản trị (Admin):** Dashboard thống kê và quản lý Games, Users, Banners, Reviews, Community Posts và Notifications.

## Chạy ở máy Local (Development)

**Yêu cầu:** Node.js >= 20, MongoDB (Local hoặc MongoDB Atlas).

1. **Cài đặt thư viện:**
   ```bash
   npm run install:all
   ```

2. **Cấu hình môi trường Backend:**
   Tạo file `server/.env` từ `server/.env.example` và điền `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (cùng `SMTP_*` hoặc `RESEND_API_KEY` nếu bật gửi OTP qua email).

3. **Khởi chạy dự án:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - Swagger Docs: `http://localhost:5000/api-docs`

**Các lệnh khác từ thư mục gốc:**
- `npm run server` — Chỉ chạy Backend (`nodemon`)
- `npm run client` — Chỉ chạy Frontend (`vite`)
- `npm run build` — Build Frontend production ra `client/dist/`
- `npm run lint` — Kiểm tra lint Frontend (`oxlint`)

## Chạy bằng Docker (Production / VPS)

1. Tạo file `server/.env` với `NODE_ENV=production` và khai báo `CORS_ORIGINS`.
2. Build và khởi chạy hệ thống:
   ```bash
   docker compose up -d --build
   ```
3. Kiểm tra trạng thái & log:
   ```bash
   docker compose ps
   docker compose logs -f
   ```
