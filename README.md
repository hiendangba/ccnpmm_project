# Zalo UTE - Hệ Thống Mạng Xã Hội Học Đường

## 📖 Giới thiệu

Zalo UTE là một ứng dụng mạng xã hội được thiết kế dành riêng cho sinh viên trường Đại học Kỹ thuật (UTE). Ứng dụng cho phép sinh viên kết nối, chia sẻ bài viết, nhắn tin, video call và quản lý các hoạt động trường lớp.

## ✨ Tính năng chính

### 🔐 Xác thực & Bảo mật
- **Đăng nhập/Đăng ký**: JWT-based authentication với MSSV và mật khẩu
- **Quên mật khẩu**: 2 bước xác thực qua OTP email
- **Đổi mật khẩu**: Secure password update
- **Remember me**: Lưu phiên đăng nhập
- **Role-based access**: Hỗ trợ admin và user

### 👥 Quản lý kết nối
- **Friend system**: Gửi/nhận/chấp nhận/từ chối lời mời kết bạn
- **Search users**: Tìm kiếm bạn bè theo tên, MSSV, email
- **Friend list**: Xem danh sách bạn bè
- **User profile**: Xem trang cá nhân người khác

### 📝 Bài viết (Posts)
- **Tạo post**: Text, hình ảnh, multiple images
- **Like/Unlike**: Tương tác với bài viết
- **Comment**: Bình luận và trả lời bình luận
- **Share**: Chia sẻ bài viết
- **Delete**: Xóa bài viết của mình
- **Infinite scroll**: Tải bài viết theo trang
- **Real-time updates**: Cập nhật qua Socket.IO

### 💬 Tin nhắn (Messages)
- **1-on-1 Chat**: Nhắn tin riêng tư
- **Group Chat**: Tạo nhóm nhắn tin
- **Real-time messaging**: Socket.IO
- **Attachment**: Gửi hình ảnh
- **Video call**: Gọi video trực tiếp

### 📤 Avatar & Cover
- **Upload avatar**: Crop và upload ảnh đại diện
- **Cover photo**: Upload ảnh bìa
- **Auto create post**: Tự động tạo post khi upload avatar

### 🔍 Tìm kiếm
- **Elasticsearch**: Tìm kiếm người dùng nhanh chóng
- **Real-time search**: Kết quả tức thời

### 👨‍💼 Quản lý (Admin)
- **Dashboard**: Thống kê tổng quan
- **User management**: Quản lý người dùng
- **Role management**: Phân quyền admin/user
- **Elasticsearch management**: Quản lý search index

## 🛠️ Công nghệ

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **UI Components**: Radix UI, Lucide Icons
- **Real-time**: Socket.IO Client
- **Build Tool**: Vite 7

### Backend
- **Framework**: Express.js 5
- **Database**: MongoDB + Mongoose 8
- **Authentication**: JWT (Access + Refresh Token)
- **Search**: Elasticsearch
- **Cache**: Redis
- **File Upload**: Cloudinary, Multer
- **Email**: Nodemailer (SMTP Gmail)
- **Real-time**: Socket.IO
- **Security**: Bcrypt, CORS

## 📁 Cấu trúc Project

```
ccnpmm_project/              # Backend
├── src/
│   ├── config/              # Cấu hình
│   │   ├── db.js           # MongoDB connection
│   │   ├── cloudinary.js   # Cloudinary config
│   │   ├── redisClient.js  # Redis config
│   │   ├── socket.js       # Socket.IO config
│   │   └── elastic.client.js # Elasticsearch config
│   ├── controllers/        # Controllers
│   ├── services/           # Business logic
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middlewares/       # Custom middlewares
│   ├── dto/               # Data Transfer Objects
│   ├── errors/            # Custom errors
│   └── utils/             # Utilities
│       ├── generateOTP.js
│       ├── mailer.js
│       └── verifyOTPUtil.js
└── index.js               # Entry point

ccnpmm_project_fe/          # Frontend
├── src/
│   ├── components/        # React components
│   │   ├── auth/          # Auth pages
│   │   ├── main/          # Main pages
│   │   │   ├── post/      # Post components
│   │   │   └── call/      # Call components
│   │   └── common/        # Common components
│   ├── contexts/          # React contexts
│   │   ├── AuthProvider.jsx
│   │   ├── MessageContext.jsx
│   │   └── FriendContext.jsx
│   ├── api/               # API clients
│   ├── hooks/             # Custom hooks
│   ├── socket/            # Socket.IO
│   ├── routes/            # Routes
│   └── utils/             # Utilities
└── vite.config.js
```

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- MongoDB
- Redis
- Elasticsearch (optional)

### Backend Setup

```bash
cd ccnpmm_project
npm install
```

Tạo file `.env`:
```env
MONGO_URI=mongodb://localhost:27017/ZaloUTE
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

REDIS_URL=rediss://default:password@host:port
HOST_REDIS=host
PASSWORD_REDIS=password
PORT_REDIS=port

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=elastic123
```

Chạy backend:
```bash
npm start
# Server chạy tại http://localhost:3001
```

### Frontend Setup

```bash
cd ccnpmm_project_fe
npm install
```

Chạy frontend:
```bash
npm run dev
# Dev server tại http://localhost:5173
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/verify-otpFP` - Verify OTP
- `POST /auth/reset-password` - Reset mật khẩu
- `POST /auth/verify-otp` - Verify OTP đăng ký
- `POST /auth/refresh-token` - Refresh token

### User
- `GET /user/profile` - Lấy thông tin user
- `PUT /user/profile` - Cập nhật profile (có thể upload avatar)
- `GET /user/all` - Lấy danh sách user
- `GET /user/find-user` - Tìm kiếm user
- `GET /user/userInfo` - Lấy thông tin user page
- `POST /user/postNew` - Tạo post mới

### Post
- `GET /post` - Lấy danh sách posts
- `POST /post/like` - Like/Unlike post
- `POST /post/comment` - Comment post
- `POST /post/share` - Share post
- `DELETE /post/:id/comment` - Xóa comment

### Friend
- `POST /friend/send` - Gửi lời mời kết bạn
- `POST /friend/accept` - Chấp nhận lời mời
- `POST /friend/reject` - Từ chối lời mời
- `DELETE /friend/:id` - Xóa bạn bè
- `GET /friend/list` - Lấy danh sách bạn bè
- `GET /friend/requests` - Lấy danh sách lời mời

### Message
- `GET /message/conversations` - Lấy danh sách conversation
- `GET /message/:id` - Lấy tin nhắn
- `POST /message/sendMessage` - Gửi tin nhắn
- `POST /message/createGroup` - Tạo group chat
- `PATCH /message/:id/read` - Đánh dấu đã đọc

## 🔒 Bảo mật

- **JWT Authentication**: Access token (1h) + Refresh token (7d)
- **Password Hashing**: Bcrypt với salt rounds 10
- **HttpOnly Cookies**: Refresh token trong cookie an toàn
- **CORS**: Chỉ cho phép origin được phép
- **Rate Limiting**: Giới hạn số lần thử OTP
- **Input Validation**: Validate input trước khi xử lý
- **Error Handling**: Xử lý lỗi an toàn

## 🎯 Tính năng nổi bật

### Real-time Updates
- Tất cả hoạt động (post, like, comment) được broadcast qua Socket.IO
- Chat real-time với Socket.IO
- Video call integration

### Image Handling
- Upload lên Cloudinary
- Crop avatar với ImageCropper
- Optimize images

### Search
- Elasticsearch cho tìm kiếm nhanh

## 👥 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under ISC License.

## 🙏 Acknowledgments

- UTE - Đại học Kỹ thuật
- React & Express communities
- All contributors


