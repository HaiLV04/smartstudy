export interface OptionItem {
  key: string;
  content: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY';
  points: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: OptionItem[];
  explanation?: string;
}

export interface Exam {
  id: string;
  slug: string;
  title: string;
  grade: number; // 1 to 5
  subject: string; // 'MATH' | 'VIETNAMESE' | 'SCIENCE' | 'HISTORY_GEOGRAPHY' | 'ENGLISH'
  subjectName: string;
  semester: number;
  durationMinutes: number;
  totalPoints: number;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questions: ExamQuestion[];
}

export const EXAMS_DATABASE: Exam[] = [
  {
    "id": "exam_lop1_toan_hk1",
    "slug": "de-kiem-tra-toan-lop-1-hoc-ki-1",
    "title": "Đề Kiểm Tra Định Kỳ Môn Toán Lớp 1 - Học Kì 1",
    "grade": 1,
    "subject": "MATH",
    "subjectName": "Toán học",
    "semester": 1,
    "durationMinutes": 35,
    "totalPoints": 10,
    "description": "Kiểm tra kiến thức đếm số, so sánh lớn bé, phép cộng trừ trong phạm vi 10 và nhận biết hình học phẳng cơ bản.",
    "difficulty": "EASY",
    "questions": [
      {
        "id": "q_t1_hk1_01",
        "questionNumber": 1,
        "content": "Số nào lớn nhất trong các số sau: 4, 7, 2, 9?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "9",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "7",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "4",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "2",
            "isCorrect": false
          }
        ],
        "explanation": "Trong dãy số 2, 4, 7, 9 thì số 9 đứng sau cùng nên 9 là số lớn nhất."
      },
      {
        "id": "q_t1_hk1_02",
        "questionNumber": 2,
        "content": "Kết quả của phép tính: 6 + 3 = ?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "9",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "8",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "10",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "7",
            "isCorrect": false
          }
        ],
        "explanation": "Ta có: 6 cộng thêm 3 đơn vị bằng 9."
      },
      {
        "id": "q_t1_hk1_03",
        "questionNumber": 3,
        "content": "Điền dấu thích hợp vào chỗ chấm: 8 - 3 ... 5",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "=",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": ">",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "<",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "+",
            "isCorrect": false
          }
        ],
        "explanation": "Ta tính vế trái: 8 - 3 = 5. So sánh 5 = 5 nên điền dấu =."
      },
      {
        "id": "q_t1_hk1_04",
        "questionNumber": 4,
        "content": "Hình bên dưới có 3 cạnh và 3 góc nhọn là hình gì?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "Hình tam giác",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Hình vuông",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Hình tròn",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Hình chữ nhật",
            "isCorrect": false
          }
        ],
        "explanation": "Hình tam giác là hình có 3 cạnh và 3 góc (hoặc 3 đỉnh)."
      },
      {
        "id": "q_t1_hk1_05",
        "questionNumber": 5,
        "content": "Tổ Một có 5 bạn nữ và 4 bạn nam. Hỏi tổ Một có tất cả bao nhiêu bạn?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "9 bạn",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "8 bạn",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "10 bạn",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "1 bạn",
            "isCorrect": false
          }
        ],
        "explanation": "Phép tính: 5 + 4 = 9 bạn."
      },
      {
        "id": "q_t1_hk1_06",
        "questionNumber": 6,
        "content": "Số liền trước của số 10 là số nào?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "9",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "11",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "8",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "10",
            "isCorrect": false
          }
        ],
        "explanation": "Số liền trước của 10 là số đứng ngay trước 10, tức là 10 - 1 = 9."
      },
      {
        "id": "q_t1_hk1_07",
        "questionNumber": 7,
        "content": "Tìm số thích hợp điền vào ô trống: ... - 4 = 6",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "10",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "2",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "8",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "9",
            "isCorrect": false
          }
        ],
        "explanation": "Muốn tìm số bị trừ, ta lấy hiệu cộng với số trừ: 6 + 4 = 10."
      },
      {
        "id": "q_t1_hk1_08",
        "questionNumber": 8,
        "content": "Có bao nhiêu hình vuông trong một ô cửa sổ chữ nhật được chia làm 4 ô vuông nhỏ?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "4 hình vuông",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "5 hình vuông",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "6 hình vuông",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "3 hình vuông",
            "isCorrect": false
          }
        ],
        "explanation": "Có 4 hình vuông nhỏ riêng lẻ (khung ngoài là hình chữ nhật)."
      }
    ]
  },
  {
    "id": "exam_lop1_tv_hk1",
    "slug": "de-kiem-tra-tieng-viet-lop-1-chinh-ta-am-van",
    "title": "Đề Kiểm Tra Tiếng Việt Lớp 1 - m Vần & Chính Tả",
    "grade": 1,
    "subject": "VIETNAMESE",
    "subjectName": "Tiếng Việt",
    "semester": 1,
    "durationMinutes": 30,
    "totalPoints": 10,
    "description": "Đánh giá kỹ năng nhận diện âm vần, phân biệt quy tắc chính tả c/k, g/gh, ng/ngh và đọc hiểu câu đơn giản.",
    "difficulty": "EASY",
    "questions": [
      {
        "id": "q_tv1_01",
        "questionNumber": 1,
        "content": "Chọn 'c' hoặc 'k' để điền vào chỗ trống: \"...on cá\"",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "c",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "k",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "q",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "ch",
            "isCorrect": false
          }
        ],
        "explanation": "Quy tắc: m 'k' chỉ đi với các âm i, e, ê. Trước âm 'o' ta viết 'c'."
      },
      {
        "id": "q_tv1_02",
        "questionNumber": 2,
        "content": "Chọn 'ng' hoặc 'ngh' để điền vào chỗ trống: \"...ỉ hè\"",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "ngh",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "ng",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "gh",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "nh",
            "isCorrect": false
          }
        ],
        "explanation": "Đứng trước âm 'i', 'e', 'ê' ta phải viết là 'ngh'."
      },
      {
        "id": "q_tv1_03",
        "questionNumber": 3,
        "content": "Từ nào dưới đây viết ĐÚNG chính tả?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "tre xanh",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "che xanh",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "te xanh",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "troi xanh",
            "isCorrect": false
          }
        ],
        "explanation": "Cây tre viết đúng là 'tre' với âm tr."
      },
      {
        "id": "q_tv1_04",
        "questionNumber": 4,
        "content": "Tiếng \"hoa\" gồm những bộ phận nào?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "m đầu h, âm đệm o, âm chính a",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "m đầu h và âm chính a",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "m đầu o và âm chính a",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Chỉ có âm đầu h",
            "isCorrect": false
          }
        ],
        "explanation": "Trong tiếng 'hoa', h là âm đầu, o là âm đệm, a là âm chính."
      },
      {
        "id": "q_tv1_05",
        "questionNumber": 5,
        "content": "Câu nào dưới đây thể hiện lời cảm ơn đúng chuẩn mực?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "Em cảm ơn cô ạ!",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Được rồi đấy!",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Em chào cô!",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Cho em xin thêm!",
            "isCorrect": false
          }
        ],
        "explanation": "Lời cảm ơn lễ phép cần có từ 'ạ' và xưng hô rõ ràng: 'Em cảm ơn cô ạ!'."
      }
    ]
  },
  {
    "id": "exam_lop2_toan_hk1",
    "slug": "de-kiem-tra-toan-lop-2-bang-nhan-chia",
    "title": "Đề Kiểm Tra Môn Toán Lớp 2 - Bảng Nhân Chia & Đo Lường",
    "grade": 2,
    "subject": "MATH",
    "subjectName": "Toán học",
    "semester": 1,
    "durationMinutes": 40,
    "totalPoints": 10,
    "description": "Kiểm tra kỹ năng tính toán phép nhân chia 2 và 5, cộng trừ có nhớ trong phạm vi 100, đo độ dài đơn vị dm, m.",
    "difficulty": "MEDIUM",
    "questions": [
      {
        "id": "q_t2_01",
        "questionNumber": 1,
        "content": "Kết quả của phép tính: 5 x 7 = ?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "35",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "30",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "40",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "25",
            "isCorrect": false
          }
        ],
        "explanation": "Theo bảng nhân 5: 5 x 7 = 35."
      },
      {
        "id": "q_t2_02",
        "questionNumber": 2,
        "content": "Có 18 bông hoa cắm đều vào 2 bình. Hỏi mỗi bình có bao nhiêu bông hoa?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "9 bông",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "8 bông",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "7 bông",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "10 bông",
            "isCorrect": false
          }
        ],
        "explanation": "Phép tính chia đều: 18 : 2 = 9 bông hoa."
      },
      {
        "id": "q_t2_03",
        "questionNumber": 3,
        "content": "1 mét (m) đổi ra đề-xi-mét (dm) bằng bao nhiêu?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "10 dm",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "100 dm",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "1 dm",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "1000 dm",
            "isCorrect": false
          }
        ],
        "explanation": "Đơn vị đo độ dài: 1 m = 10 dm = 100 cm."
      },
      {
        "id": "q_t2_04",
        "questionNumber": 4,
        "content": "Kết quả của phép cộng có nhớ: 48 + 37 = ?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "85",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "75",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "84",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "95",
            "isCorrect": false
          }
        ],
        "explanation": "8 + 7 = 15 viết 5 nhớ 1. 4 + 3 = 7 thêm 1 bằng 8. Kết quả là 85."
      },
      {
        "id": "q_t2_05",
        "questionNumber": 5,
        "content": "Tìm y, biết: y - 26 = 45",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "y = 71",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "y = 61",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "y = 19",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "y = 81",
            "isCorrect": false
          }
        ],
        "explanation": "y = 45 + 26 = 71."
      }
    ]
  },
  {
    "id": "exam_lop2_tv_hk1",
    "slug": "de-kiem-tra-tieng-viet-lop-2-tu-loai-cau-kieu",
    "title": "Đề Kiểm Tra Tiếng Việt Lớp 2 - Từ Loại & Các Kiểu Câu",
    "grade": 2,
    "subject": "VIETNAMESE",
    "subjectName": "Tiếng Việt",
    "semester": 1,
    "durationMinutes": 35,
    "totalPoints": 10,
    "description": "Đánh giá khả năng phân loại từ chỉ sự vật, hoạt động, đặc điểm và nhận diện các kiểu câu Ai là gì?, Ai làm gì?, Ai thế nào?.",
    "difficulty": "MEDIUM",
    "questions": [
      {
        "id": "q_tv2_01",
        "questionNumber": 1,
        "content": "Nhóm từ nào sau đây gồm toàn các từ chỉ HOẠT ĐỘNG?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "đọc sách, múa hát, chạy nhảy",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "thầy giáo, trường học, bút mực",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "chăm chỉ, ngoan ngoãn, siêng năng",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "bông hoa, mặt trời, ngôi sao",
            "isCorrect": false
          }
        ],
        "explanation": "Các từ đọc sách, múa hát, chạy nhảy đều diễn tả hành động của con người."
      },
      {
        "id": "q_tv2_02",
        "questionNumber": 2,
        "content": "Câu: \"Bác nông dân đang cày ruộng.\" thuộc kiểu câu nào?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "Ai làm gì?",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Ai là gì?",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Ai thế nào?",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Câu cầu khiến",
            "isCorrect": false
          }
        ],
        "explanation": "'đang cày ruộng' là hoạt động nên câu thuộc mẫu 'Ai làm gì?'."
      },
      {
        "id": "q_tv2_03",
        "questionNumber": 3,
        "content": "Dấu câu nào thích hợp điền vào cuối câu: \"Hôm nay lớp mình học bài gì vậy nhỉ...\"",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "Dấu chấm hỏi (?)",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Dấu chấm (.)",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Dấu chấm than (!)",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Dấu hai chấm (:)",
            "isCorrect": false
          }
        ],
        "explanation": "Đây là câu hỏi nên cuối câu phải đặt dấu chấm hỏi."
      }
    ]
  },
  {
    "id": "exam_lop3_toan_hk1",
    "slug": "de-kiem-tra-toan-lop-3-chu-vi-dien-tich",
    "title": "Đề Kiểm Tra Môn Toán Lớp 3 - Chu Vi, Diện Tích & Biểu Thức",
    "grade": 3,
    "subject": "MATH",
    "subjectName": "Toán học",
    "semester": 1,
    "durationMinutes": 40,
    "totalPoints": 10,
    "description": "Đánh giá công thức tính chu vi và diện tích hình vuông, hình chữ nhật; giá trị biểu thức và bảng nhân chia.",
    "difficulty": "MEDIUM",
    "questions": [
      {
        "id": "q_t3_01",
        "questionNumber": 1,
        "content": "Một mảnh vườn hình chữ nhật có chiều dài 9 m, chiều rộng 6 m. Diện tích mảnh vườn là:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "54 m²",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "30 m²",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "15 m²",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "45 m²",
            "isCorrect": false
          }
        ],
        "explanation": "Diện tích hình chữ nhật = dài x rộng = 9 x 6 = 54 m²."
      },
      {
        "id": "q_t3_02",
        "questionNumber": 2,
        "content": "Một hình vuông có chu vi là 36 cm. Độ dài cạnh của hình vuông đó là:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "9 cm",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "6 cm",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "8 cm",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "12 cm",
            "isCorrect": false
          }
        ],
        "explanation": "Chu vi hình vuông = cạnh x 4, nên cạnh = Chu vi : 4 = 36 : 4 = 9 cm."
      },
      {
        "id": "q_t3_03",
        "questionNumber": 3,
        "content": "Tính giá trị biểu thức: 120 - 20 x 4",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "40",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "400",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "80",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "100",
            "isCorrect": false
          }
        ],
        "explanation": "Thực hiện nhân trước: 20 x 4 = 80. Sau đó 120 - 80 = 40."
      }
    ]
  },
  {
    "id": "exam_lop3_science_hk1",
    "slug": "de-kiem-tra-tnxh-khoa-hoc-lop-3",
    "title": "Đề Kiểm Tra Tự Nhiên & Xã Hội Lớp 3 - Cơ Thể Người & Bầu Trời",
    "grade": 3,
    "subject": "SCIENCE",
    "subjectName": "Khoa học & TNXH",
    "semester": 1,
    "durationMinutes": 35,
    "totalPoints": 10,
    "description": "Đánh giá hiểu biết về cơ quan tuần hoàn, cơ quan hô hấp, cơ quan thần kinh và Trái Đất trong hệ Mặt Trời.",
    "difficulty": "EASY",
    "questions": [
      {
        "id": "q_kh3_01",
        "questionNumber": 1,
        "content": "Cơ quan tuần hoàn trong cơ thể gồm những bộ phận nào?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "Tim và các mạch máu",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Dạ dày và ruột",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Phổi và khí quản",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Não và tủy sống",
            "isCorrect": false
          }
        ],
        "explanation": "Cơ quan tuần hoàn gồm có tim và mạng lưới các mạch máu."
      },
      {
        "id": "q_kh3_02",
        "questionNumber": 2,
        "content": "Trái Đất quay một vòng quanh Mặt Trời mất khoảng thời gian bao lâu?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "1 năm (365 ngày hoặc 366 ngày)",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "24 giờ (1 ngày đêm)",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "1 tháng (30 ngày)",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "100 ngày",
            "isCorrect": false
          }
        ],
        "explanation": "Trái Đất tự quay quanh mình hết 24 giờ, và quay một vòng quanh Mặt Trời hết 1 năm."
      }
    ]
  },
  {
    "id": "exam_lop4_toan_hk1",
    "slug": "de-kiem-tra-toan-lop-4-phan-so-trung-binh-cong",
    "title": "Đề Kiểm Tra Môn Toán Lớp 4 - Phân Số, Trung Bình Cộng & Hình Học",
    "grade": 4,
    "subject": "MATH",
    "subjectName": "Toán học",
    "semester": 1,
    "durationMinutes": 45,
    "totalPoints": 10,
    "description": "Khảo sát kiến thức phân số, rút gọn phân số, tính trung bình cộng, diện tích hình thoi và hình bình hành.",
    "difficulty": "HARD",
    "questions": [
      {
        "id": "q_t4_01",
        "questionNumber": 1,
        "content": "Rút gọn phân số 24/36 về dạng phân số tối giản được:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "2/3",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "4/6",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "12/18",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "3/4",
            "isCorrect": false
          }
        ],
        "explanation": "Chia cả tử và mẫu cho ước chung lớn nhất là 12: 24:12 = 2, 36:12 = 3. Kết quả là 2/3."
      },
      {
        "id": "q_t4_02",
        "questionNumber": 2,
        "content": "Tìm số trung bình cộng của ba số: 25, 35 và 45.",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "35",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "30",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "40",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "105",
            "isCorrect": false
          }
        ],
        "explanation": "Trung bình cộng = (25 + 35 + 45) : 3 = 105 : 3 = 35."
      },
      {
        "id": "q_t4_03",
        "questionNumber": 3,
        "content": "Diện tích hình thoi có độ dài hai đường chéo là 8 cm và 6 cm bằng bao nhiêu?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "24 cm²",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "48 cm²",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "14 cm²",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "28 cm²",
            "isCorrect": false
          }
        ],
        "explanation": "Diện tích hình thoi = (đường chéo 1 x đường chéo 2) : 2 = (8 x 6) : 2 = 24 cm²."
      }
    ]
  },
  {
    "id": "exam_lop4_history_hk1",
    "slug": "de-kiem-tra-lich-su-dia-ly-lop-4",
    "title": "Đề Kiểm Tra Lịch Sử & Địa Lý Lớp 4 - Các Triều Đại & Vùng Miền Đất Nước",
    "grade": 4,
    "subject": "HISTORY_GEOGRAPHY",
    "subjectName": "Lịch sử & Địa lý",
    "semester": 1,
    "durationMinutes": 40,
    "totalPoints": 10,
    "description": "Đánh giá các sự kiện lịch sử dựng nước giữ nước và đặc điểm tự nhiên các vùng Trung du, Tây Nguyên, Đồng bằng sông Hồng.",
    "difficulty": "MEDIUM",
    "questions": [
      {
        "id": "q_ls4_01",
        "questionNumber": 1,
        "content": "Chiến thắng trên sông Bạch Đằng năm 938 do ai lãnh đạo đã chấm dứt hơn 1000 năm Bắc thuộc?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "EASY",
        "options": [
          {
            "key": "A",
            "content": "Ngô Quyền",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Đinh Bộ Lĩnh",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Hai Bà Trưng",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Trần Hưng Đạo",
            "isCorrect": false
          }
        ],
        "explanation": "Năm 938, Ngô Quyền đã cắm cọc ngầm trên sông Bạch Đằng đánh tan quân xâm lược Nam Hán."
      },
      {
        "id": "q_dl4_01",
        "questionNumber": 2,
        "content": "Đặc điểm nổi bật của địa hình vùng Tây Nguyên là gì?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "Gồm các cao nguyên xếp tầng rộng lớn với đất đỏ ba-dan màu mỡ",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Đồng bằng bằng phẳng thẳng cánh cò bay",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Nhiều đồi hình bát úp",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Vùng đầm lầy ngập mặn",
            "isCorrect": false
          }
        ],
        "explanation": "Tây Nguyên là xứ sở của các cao nguyên xếp tầng (Kon Tum, Pleiku, Đắk Lắk, Lâm Viên...)."
      }
    ]
  },
  {
    "id": "exam_lop5_toan_hk1",
    "slug": "de-kiem-tra-toan-lop-5-so-thap-phan-chuyen-dong",
    "title": "Đề Kiểm Tra Môn Toán Lớp 5 - Số Thập Phân, % & Toán Chuyển Động Đều",
    "grade": 5,
    "subject": "MATH",
    "subjectName": "Toán học",
    "semester": 1,
    "durationMinutes": 45,
    "totalPoints": 10,
    "description": "Đánh giá khả năng tính toán số thập phân, tỉ số phần trăm, diện tích hình tròn, thể tích hình lập phương và toán chuyển động.",
    "difficulty": "HARD",
    "questions": [
      {
        "id": "q_t5_01",
        "questionNumber": 1,
        "content": "Viết phân số 3/5 dưới dạng tỉ số phần trăm là:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "60%",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "35%",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "30%",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "75%",
            "isCorrect": false
          }
        ],
        "explanation": "3/5 = 0,6 = 60%."
      },
      {
        "id": "q_t5_02",
        "questionNumber": 2,
        "content": "Một người đi xe máy đi được quãng đường 105 km trong 2,5 giờ. Vận tốc của người đó là:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "42 km/h",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "40 km/h",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "45 km/h",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "50 km/h",
            "isCorrect": false
          }
        ],
        "explanation": "Công thức v = s : t = 105 : 2,5 = 42 km/h."
      },
      {
        "id": "q_t5_03",
        "questionNumber": 3,
        "content": "Một hình tròn có đường kính d = 4 cm. Diện tích của hình tròn đó là:",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "HARD",
        "options": [
          {
            "key": "A",
            "content": "12,56 cm²",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "50,24 cm²",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "6,28 cm²",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "25,12 cm²",
            "isCorrect": false
          }
        ],
        "explanation": "Bán kính r = 4 : 2 = 2 cm. Diện tích S = r x r x 3,14 = 2 x 2 x 3,14 = 12,56 cm²."
      }
    ]
  },
  {
    "id": "exam_lop5_tv_hk1",
    "slug": "de-kiem-tra-tieng-viet-lop-5-tu-dong-am-dong-nghia",
    "title": "Đề Kiểm Tra Tiếng Việt Lớp 5 - Từ Đồng m, Đồng Nghĩa, Trái Nghĩa & Quan Hệ Từ",
    "grade": 5,
    "subject": "VIETNAMESE",
    "subjectName": "Tiếng Việt",
    "semester": 1,
    "durationMinutes": 40,
    "totalPoints": 10,
    "description": "Phân biệt hiện tượng từ đồng âm, từ đồng nghĩa, từ trái nghĩa, từ nhiều nghĩa và cách nối các vế câu ghép bằng quan hệ từ.",
    "difficulty": "HARD",
    "questions": [
      {
        "id": "q_tv5_01",
        "questionNumber": 1,
        "content": "Trong hai câu: \"Con ruồi đậu mâm xôi đậu.\" và \"Thi đậu đại học.\", các từ 'đậu' có quan hệ gì với nhau?",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "Từ đồng âm",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Từ nhiều nghĩa",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Từ đồng nghĩa",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Từ trái nghĩa",
            "isCorrect": false
          }
        ],
        "explanation": "Các từ 'đậu' (hành động đỗ lại), 'đậu' (hạt đỗ/đậu), 'đậu' (thi đỗ/đạt) phát âm giống hệt nhau nhưng nghĩa hoàn toàn khác nhau không liên quan gì đến nhau, nên đó là từ đồng âm."
      },
      {
        "id": "q_tv5_02",
        "questionNumber": 2,
        "content": "Chọn cặp quan hệ từ thích hợp điền vào câu: \"... trời mưa to ... chúng em vẫn đến trường đúng giờ.\"",
        "type": "MULTIPLE_CHOICE",
        "points": 1,
        "difficulty": "MEDIUM",
        "options": [
          {
            "key": "A",
            "content": "Tuy ... nhưng ... (Tương phản)",
            "isCorrect": true
          },
          {
            "key": "B",
            "content": "Vì ... nên ... (Nguyên nhân - kết quả)",
            "isCorrect": false
          },
          {
            "key": "C",
            "content": "Nếu ... thì ... (Giả thiết - kết quả)",
            "isCorrect": false
          },
          {
            "key": "D",
            "content": "Càng ... càng ... (Tăng tiến)",
            "isCorrect": false
          }
        ],
        "explanation": "Hai vế câu có ý nghĩa đối lập tương phản nhau nên dùng cặp quan hệ từ 'Tuy ... nhưng ...'."
      }
    ]
  }
];
