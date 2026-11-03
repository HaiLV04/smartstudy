# 🎓 SmartStudy 3D — Trò Chơi Dạy Học Tương Tác & Hệ Thống Ngân Hàng Đề Thi Tiểu Học Lớp 1 - 5

Dự án giáo dục số hiện đại được nâng cấp và xây dựng trên nền tảng **Next.js 14** kết hợp **Three.js (3D Graphics & Physics)**, tích hợp sẵn **Ngân hàng đề thi và bộ câu hỏi trắc nghiệm chuẩn Chương trình GDPT 2018 cho học sinh tiểu học từ Lớp 1 đến Lớp 5**.

---

## 🌟 Điểm Nổi Bật Của Dự Án

### 1. 🔮 Đồ Họa 3D Tương Tác Sống Động (Three.js)
* **Vòng Quay May Mắn 3D (`/games/vong-quay-3d`):** Vòng quay hình khối trụ 3D góc nghiêng không gian thật, viền kim loại ánh vàng, kim chỉ 3D rung lắc và âm thanh tíc-tắc theo gia tốc vật lý.
* **Đua Vịt Tri Thức 3D (`/games/dua-vit-3d`):** Dòng sông 3D mô phỏng sóng nước thời gian thực (`Water Wave Simulation`), 4 chú vịt bơi đua nhấp nhô theo từng câu trả lời đúng.
* **Kéo Co Tri Thức 3D (`/games/keo-co-3d`):** Đấu trường kéo co thể thao 3D giữa hai đội Đỏ và Xanh, lực giằng co di chuyển thời gian thực theo câu trả lời đúng.
* **3D Hero Scene (`Hero3D`):** Không gian các khối đa diện toán học và tinh vân tương tác xoay chuyển mượt mà theo cử chỉ chuột.

### 2. 📚 Ngân Hàng Đề Thi & Câu Hỏi Chuẩn Lớp 1 - 5
* Đầy đủ các phân môn: **Toán học, Tiếng Việt, Tự nhiên & Xã hội, Khoa học, Lịch sử & Địa lý, Tiếng Anh**.
* Mỗi câu hỏi có đầy đủ: Thang điểm, mức độ khó (Nhận biết, Thông hiểu, Vận dụng), đáp án đúng và **Lời giải/Hướng dẫn chi tiết**.
* Bộ đề được đóng gói sẵn dưới 3 định dạng:
  * **TypeScript (`data/exams.ts`):** Sử dụng ngay trong code frontend/backend React/Next.js.
  * **JSON (`data/exams.json`):** Dễ dàng import vào bất kỳ ngôn ngữ nào (Python, Node.js, PHP, Java...).
  * **Định dạng StudyAI (`.txt`):** Cú pháp `Câu hỏi | Đúng | Sai 1 | Sai 2` để in ấn hoặc copy nhanh.

### 3. 🛠️ Gói Tài Nguyên Phát Triển Web (`/web-exam-system`)
Dành riêng cho các nhà phát triển muốn tích hợp hệ thống thi trực tuyến vào website quản lý/học tập cá nhân:
* **Prisma Schema Add-on (`prisma/schema_addon.prisma`):** Các model `Exam`, `Question`, `QuestionOption`, `ExamSubmission` sẵn sàng nạp vào MySQL/PostgreSQL.
* **Seed Script (`prisma/seed_exams.ts`):** Nạp tự động toàn bộ đề thi vào Database chỉ với 1 câu lệnh.
* **API Route Mẫu (`api_sample/route.ts`):** REST API Next.js App Router tự động chấm điểm bài nộp và trả về bảng điểm chi tiết.

### 4. 📦 Bản Clone 100% Gốc StudyAI (`/studyai-original`)
* Lưu trữ offline đầy đủ toàn bộ 48 trò chơi gốc từ `https://app.studyai.id.vn/index.html`.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy ở chế độ phát triển (Development):
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`

### 3. Build chạy sản phẩm (Production):
```bash
npm run build
npm run start
```

---

## 📂 Cấu Trúc Thư Mục

```
smartstudy/
├── app/                          # Next.js 14 App Router
│   ├── page.tsx                  # Trang chủ 3D & bộ lọc tìm kiếm 48 game
│   ├── layout.tsx                # Layout chuẩn Glassmorphism
│   └── games/
│       ├── vong-quay-3d/         # Game Vòng Quay 3D
│       ├── dua-vit-3d/           # Game Đua Vịt 3D
│       ├── keo-co-3d/            # Game Kéo Co 3D
│       └── ngan-hang-de/         # Trung tâm duyệt & tải đề thi Lớp 1 - 5
│
├── components/
│   ├── Hero3D.tsx                # Không gian 3D tương tác chuột
│   ├── Navbar.tsx                # Menu điều hướng
│   └── QuestionBankModal.tsx     # Popup nạp đề Lớp 1 - 5 vào game tức thì
│
├── data/
│   ├── gamesList.ts              # Danh mục đầy đủ 48 trò chơi
│   └── questionBanks.ts          # Ngân hàng đề thi phân cấp theo lớp
│
├── lib/
│   ├── audio.ts                  # Bộ tổng hợp âm thanh Web Audio API không cần mp3
│   └── storage.ts                # Thuật toán xáo trộn ngẫu nhiên & lưu trữ
│
├── web-exam-system/              # Gói phát triển hệ thống thi cho Web cá nhân
│   ├── data/ (exams.json, exams.ts)
│   ├── prisma/ (schema_addon.prisma, seed_exams.ts)
│   ├── api_sample/ (route.ts)
│   └── HUONG_DAN_TICH_HOP_WEB.md
│
└── studyai-original/             # Bản clone tĩnh 100% của StudyAI gốc
```

---

## 👨‍💻 Tác giả & Giấy phép
* **Repository:** [HaiLV04/smartstudy](https://github.com/HaiLV04/smartstudy)
* **Giấy phép:** MIT License
