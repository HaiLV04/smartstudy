# 📘 HƯỚNG DẪN TÍCH HỢP HỆ THỐNG ĐỀ THI LỚP 1 - 5 VÀO TRANG WEB CỦA BẠN

Tài liệu này được chuẩn bị riêng để bạn **phát triển hệ thống thi trắc nghiệm, bài tập trực tuyến và quản lý học sinh trên website cá nhân của bạn** (như hệ thống `hocthem` hoặc bất kỳ dự án web nào khác).

---

## 📁 1. Cấu trúc thư mục bàn giao tại `F:\Hoài thanh\Phat_Trien_Web_De_Thi`

```
F:\Hoài thanh\Phat_Trien_Web_De_Thi\
├── data/
│   ├── exams.json          # Dữ liệu chuẩn JSON thuần (dễ import vào mọi ngôn ngữ/database)
│   └── exams.ts            # Dữ liệu TypeScript có đầy đủ Interface, Types chuẩn
├── prisma/
│   ├── schema_addon.prisma # Model Exam, Question, Option, Submission để dán vào Prisma
│   └── seed_exams.ts       # Script tự động bơm toàn bộ đề vào Database MySQL/Postgres
├── api_sample/
│   └── route.ts            # Mẫu API Next.js App Router (lấy danh sách & tự động chấm điểm)
└── HUONG_DAN_TICH_HOP_WEB.md
```

> **Đặc biệt:** Tôi đã copy sẵn file `exams.ts` trực tiếp vào mã nguồn website của bạn tại:
> `f:\Code\hocthem\src\data\exams.ts`. Bạn có thể mở code và import dùng ngay!

---

## 🚀 2. Cách sử dụng nhanh (3 Cách phát triển)

### Cách A: Sử dụng trực tiếp trong Frontend (Không cần database)
Nếu web của bạn viết bằng React / Next.js, bạn chỉ cần import trực tiếp dữ liệu:

```typescript
import { EXAMS_DATABASE } from '@/data/exams';

export default function ExamListPage() {
  // Lấy tất cả đề thi Toán Lớp 1
  const lop1MathExams = EXAMS_DATABASE.filter(e => e.grade === 1 && e.subject === 'MATH');

  return (
    <div>
      <h1>Danh sách đề thi Lớp 1</h1>
      {lop1MathExams.map(exam => (
        <div key={exam.id}>
          <h3>{exam.title}</h3>
          <p>Thời gian: {exam.durationMinutes} phút - {exam.questions.length} câu hỏi</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Cách B: Tích hợp vào Cơ sở dữ liệu (MySQL / Prisma)
Nếu website của bạn dùng Prisma (như dự án `hocthem`):

1. **Bước 1:** Mở file `prisma/schema.prisma` trong dự án web của bạn, sao chép nội dung từ:
   `F:\Hoài thanh\Phat_Trien_Web_De_Thi\prisma\schema_addon.prisma` dán vào cuối file `schema.prisma`.
2. **Bước 2:** Chạy lệnh tạo bảng trong database:
   ```bash
   npx prisma db push
   # hoặc: npx prisma migrate dev --name add_exam_system
   ```
3. **Bước 3:** Chạy file seed để nạp đề thi vào database:
   ```bash
   npx tsx F:/Hoài\ thanh/Phat_Trien_Web_De_Thi/prisma/seed_exams.ts
   ```

---

### Cách C: Tạo REST API cho ứng dụng Mobile / Web Client
Sao chép file mẫu `api_sample/route.ts` vào thư mục API của bạn (ví dụ `src/app/api/exams/route.ts`).
Hệ thống sẽ cung cấp sẵn:
* `GET /api/exams?grade=1&subject=MATH` $\rightarrow$ Trả về danh sách đề thi theo lớp & môn.
* `POST /api/exams` $\rightarrow$ Gửi đáp án học sinh chọn lên để hệ thống tự động so khớp, tính điểm và trả về kết quả kèm lời giải chi tiết.

---

## 📊 3. Chuẩn hóa dữ liệu câu hỏi trong đề thi

Mỗi đề thi được đóng gói chuẩn chỉnh theo định dạng:

```json
{
  "id": "exam_lop1_toan_hk1",
  "slug": "de-kiem-tra-toan-lop-1-hoc-ki-1",
  "title": "Đề Kiểm Tra Định Kỳ Môn Toán Lớp 1 - Học Kì 1",
  "grade": 1,
  "subject": "MATH",
  "subjectName": "Toán học",
  "durationMinutes": 35,
  "totalPoints": 10,
  "difficulty": "EASY",
  "questions": [
    {
      "id": "q_t1_hk1_01",
      "questionNumber": 1,
      "content": "Số nào lớn nhất trong các số sau: 4, 7, 2, 9?",
      "type": "MULTIPLE_CHOICE",
      "points": 1,
      "options": [
        { "key": "A", "content": "9", "isCorrect": true },
        { "key": "B", "content": "7", "isCorrect": false },
        { "key": "C", "content": "4", "isCorrect": false },
        { "key": "D", "content": "2", "isCorrect": false }
      ],
      "explanation": "Trong dãy số 2, 4, 7, 9 thì số 9 đứng sau cùng nên 9 là số lớn nhất."
    }
  ]
}
```

Toàn bộ câu hỏi đều có:
1. **Khóa đáp án chính xác (`isCorrect: true`)** để hệ thống tự động chấm điểm.
2. **Điểm số từng câu (`points`)** để tính thang điểm 10 hoặc 100.
3. **Mức độ khó (`difficulty`: EASY - Nhận biết, MEDIUM - Thông hiểu, HARD - Vận dụng)** để phân loại học sinh.
4. **Lời giải & Giải thích chi tiết (`explanation`)** để học sinh xem lại sau khi nộp bài.
