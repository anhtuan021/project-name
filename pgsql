project-name/
│── src/                     # Thư mục chính chứa toàn bộ mã nguồn
│   ├── auth/                # Module xác thực người dùng
│   │   ├── dto/             # Chứa các Data Transfer Object (DTO) cho Auth
│   │   │   ├── create-auth.dto.ts   # Định nghĩa dữ liệu khi tạo tài khoản
│   │   │   ├── update-auth.dto.ts   # Định nghĩa dữ liệu khi cập nhật tài khoản
│   │   ├── passport/        # Chứa các chiến lược xác thực sử dụng Passport.js
│   │   │   ├── jwt-auth.guard.ts     # Bảo vệ API bằng JWT (Guard)
│   │   │   ├── jwt.strategy.ts       # Chiến lược xác thực JWT
│   │   │   ├── local-auth.guard.ts   # Bảo vệ API bằng xác thực Local (tài khoản/mật khẩu)
│   │   │   ├── local.strategy.ts     # Chiến lược xác thực Local
│   │   ├── auth.controller.ts   # Xử lý các request liên quan đến xác thực (đăng nhập, đăng ký)
│   │   ├── auth.module.ts       # Module của Auth, khai báo provider & controller
│   │   ├── auth.service.ts      # Xử lý logic xác thực (mã hóa mật khẩu, tạo token)
│   │   ├── decorators/          # Chứa các decorator tùy chỉnh
│   │   │   ├── customize.ts     # Ví dụ về một decorator tùy chỉnh
│   │   ├── helpers/             # Chứa các hàm tiện ích dùng chung
│   │   │   ├── util.ts          # Hàm hỗ trợ xử lý mật khẩu bằng thư viện bcrypt
│   ├── mail/                    # Quản lý email
│   │   ├── templates/           # Chứa các template email
│   │   │   ├── register.hbs     # Template email đăng ký tài khoản
│   ├── modules/                 # Chứa các module chính của ứng dụng
│   │   ├── user/                # Module quản lý người dùng
│   │   │   ├── dto/             # Chứa các Data Transfer Object (DTO) của User
│   │   │   │   ├── create-user.dto.ts  # DTO tạo user mới
│   │   │   │   ├── update-user.dto.ts  # DTO cập nhật thông tin user
│   │   │   ├── schemas/         # Chứa schema của MongoDB
│   │   │   │   ├── user.schema.ts   # Định nghĩa schema của User
│   │   │   ├── user.controller.ts   # Điều khiển API của User (GET, POST, PUT, DELETE)
│   │   │   ├── user.module.ts       # Module của User
│   │   │   ├── user.service.ts      # Xử lý logic nghiệp vụ của User
│   ├── app.controller.ts        # Controller gốc của ứng dụng
│   ├── app.module.ts            # Module chính, nơi import các module con
│   ├── app.service.ts           # Service chính của ứng dụng
│   ├── main.ts                  # Entry point, nơi khởi chạy ứng dụng
│── test/                        # Chứa các file test của ứng dụng
│── node_modules/                # Thư viện bên thứ ba (được tạo khi cài `npm install`)
│── package.json                 # Khai báo dependencies, script và thông tin dự án
│── tsconfig.json                # Cấu hình TypeScript
│── nest-cli.json                # Cấu hình NestJS CLI
│── .env                         # Biến môi trường (cấu hình DB, JWT_SECRET, API keys, ...)
│── .gitignore                    # Bỏ qua các file không cần thiết khi push lên GitHub
