export interface Question {
  id: string;
  question: string;
  options: string[];
  correct: number; // 0 index is the correct answer
  hint?: string;
}

export interface SubjectBank {
  subjectId: string;
  subjectName: string;
  icon: string;
  questions: Question[];
}

export interface GradeBank {
  grade: number;
  gradeTitle: string;
  description: string;
  subjects: SubjectBank[];
}

export const QUESTION_BANKS: GradeBank[] = [
  // ==========================================
  // KHỐI LỚP 1
  // ==========================================
  {
    grade: 1,
    gradeTitle: "Khối Lớp 1",
    description: "Bộ câu hỏi kiến thức nền tảng: Toán, Tiếng Việt, Tự nhiên & Xã hội (Chuẩn CT 2018)",
    subjects: [
      {
        subjectId: "toan-1",
        subjectName: "Toán 1",
        icon: "🔢",
        questions: [
          {
            id: "t1_01",
            question: "Kết quả của phép tính: 4 + 5 = ?",
            options: ["9", "8", "10", "7"],
            correct: 0,
            hint: "Đếm thêm 5 đơn vị từ số 4"
          },
          {
            id: "t1_02",
            question: "Số nào lớn hơn số 8?",
            options: ["9", "7", "6", "5"],
            correct: 0
          },
          {
            id: "t1_03",
            question: "Điền dấu thích hợp: 10 - 3 ... 6",
            options: [">", "<", "=", "+"],
            correct: 0,
            hint: "10 - 3 = 7, so sánh 7 và 6"
          },
          {
            id: "t1_04",
            question: "Hình có 3 cạnh và 3 đỉnh là hình gì?",
            options: ["Hình tam giác", "Hình tròn", "Hình vuông", "Hình chữ nhật"],
            correct: 0
          },
          {
            id: "t1_05",
            question: "Có 8 quả táo, Nam ăn mất 2 quả. Hỏi còn lại mấy quả táo?",
            options: ["6 quả", "5 quả", "7 quả", "10 quả"],
            correct: 0
          },
          {
            id: "t1_06",
            question: "Số bé nhất có hai chữ số là số nào?",
            options: ["10", "11", "0", "99"],
            correct: 0
          },
          {
            id: "t1_07",
            question: "Số liền trước của số 20 là số nào?",
            options: ["19", "21", "18", "22"],
            correct: 0
          },
          {
            id: "t1_08",
            question: "Phép tính nào dưới đây có kết quả bằng 10?",
            options: ["6 + 4", "7 + 2", "5 + 4", "3 + 6"],
            correct: 0
          },
          {
            id: "t1_09",
            question: "1 chục và 5 đơn vị viết là số mấy?",
            options: ["15", "51", "105", "50"],
            correct: 0
          },
          {
            id: "t1_10",
            question: "Kết quả của phép tính: 18 - 8 = ?",
            options: ["10", "8", "9", "12"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tieng-viet-1",
        subjectName: "Tiếng Việt 1",
        icon: "📖",
        questions: [
          {
            id: "tv1_01",
            question: "Điền chữ còn thiếu vào chỗ trống: \"...hoa hồng\"",
            options: ["bông", "bôm", "bôngg", "vông"],
            correct: 0
          },
          {
            id: "tv1_02",
            question: "Tìm từ viết đúng chính tả:",
            options: ["con trâu", "con châu", "con sâu", "con trau"],
            correct: 0
          },
          {
            id: "tv1_03",
            question: "Tiếng \"hoa\" gồm những âm nào?",
            options: ["m h, âm đệm o, âm chính a", "m h và âm a", "m o và âm a", "Chỉ có âm h"],
            correct: 0
          },
          {
            id: "tv1_04",
            question: "Từ nào sau đây chỉ người trong gia đình?",
            options: ["Bà nội", "Cái bàn", "Mặt trời", "Con cá"],
            correct: 0
          },
          {
            id: "tv1_05",
            question: "Điền chữ 'c' hoặc 'k' thích hợp: \"...on kiến\"",
            options: ["c", "k", "q", "ch"],
            correct: 0,
            hint: "Đứng trước 'o' ta dùng 'c'"
          },
          {
            id: "tv1_06",
            question: "Điền chữ 'ng' hoặc 'ngh' thích hợp: \"...ỉ hè\"",
            options: ["ngh", "ng", "gh", "g"],
            correct: 0,
            hint: "Đứng trước i, e, ê ta viết 'ngh'"
          },
          {
            id: "tv1_07",
            question: "Câu nào dưới đây là câu chào hỏi lịch sự?",
            options: ["Em chào cô ạ!", "Cô đi đâu đấy?", "Ơ cô!", "Đưa bút đây!"],
            correct: 0
          },
          {
            id: "tv1_08",
            question: "Tìm từ trái nghĩa với từ \"to\":",
            options: ["nhỏ", "dài", "rộng", "cao"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tnxh-1",
        subjectName: "Tự nhiên & Xã hội 1",
        icon: "🌱",
        questions: [
          {
            id: "tn1_01",
            question: "Bộ phận nào giúp cơ thể chúng ta nhìn thấy cảnh vật xung quanh?",
            options: ["Mắt", "Tai", "Mũi", "Lưỡi"],
            correct: 0
          },
          {
            id: "tn1_02",
            question: "Hành động nào giúp bảo vệ răng miệng luôn sạch sẽ?",
            options: ["Đánh răng sau khi ăn và trước khi ngủ", "Ăn nhiều kẹo ngọt", "Uống nước đá lạnh", "Không cần súc miệng"],
            correct: 0
          },
          {
            id: "tn1_03",
            question: "Đèn giao thông màu nào báo hiệu người đi đường phải dừng lại?",
            options: ["Đèn đỏ", "Đèn xanh", "Đèn vàng", "Đèn tím"],
            correct: 0
          },
          {
            id: "tn1_04",
            question: "Con vật nào sau đây đẻ trứng?",
            options: ["Con gà", "Con chó", "Con mèo", "Con bò"],
            correct: 0
          },
          {
            id: "tn1_05",
            question: "Khi thấy người lớn đến nhà chơi, em nên làm gì?",
            options: ["Chào hỏi lễ phép và mời vào nhà", "Bỏ chạy vào phòng đóng cửa", "Không nói gì", "Xem tivi tiếp"],
            correct: 0
          }
        ]
      }
    ]
  },

  // ==========================================
  // KHỐI LỚP 2
  // ==========================================
  {
    grade: 2,
    gradeTitle: "Khối Lớp 2",
    description: "Bộ câu hỏi bồi dưỡng: Bảng nhân 2-5, cộng trừ có nhớ, từ chỉ sự vật/hoạt động/đặc điểm",
    subjects: [
      {
        subjectId: "toan-2",
        subjectName: "Toán 2",
        icon: "📐",
        questions: [
          {
            id: "t2_01",
            question: "Kết quả của phép nhân: 2 x 8 = ?",
            options: ["16", "18", "14", "12"],
            correct: 0
          },
          {
            id: "t2_02",
            question: "Kết quả của phép tính: 5 x 6 = ?",
            options: ["30", "25", "35", "40"],
            correct: 0
          },
          {
            id: "t2_03",
            question: "Có 20 cái kẹo chia đều cho 5 bạn. Mỗi bạn được mấy cái kẹo?",
            options: ["4 cái", "5 cái", "3 cái", "6 cái"],
            correct: 0
          },
          {
            id: "t2_04",
            question: "1 mét (m) bằng bao nhiêu xăng-ti-mét (cm)?",
            options: ["100 cm", "10 cm", "1000 cm", "50 cm"],
            correct: 0
          },
          {
            id: "t2_05",
            question: "Một ngày có bao nhiêu giờ?",
            options: ["24 giờ", "12 giờ", "48 giờ", "20 giờ"],
            correct: 0
          },
          {
            id: "t2_06",
            question: "Kết quả của phép cộng: 47 + 25 = ?",
            options: ["72", "62", "71", "82"],
            correct: 0
          },
          {
            id: "t2_07",
            question: "Tìm x, biết: x + 15 = 40",
            options: ["x = 25", "x = 35", "x = 55", "x = 20"],
            correct: 0
          },
          {
            id: "t2_08",
            question: "Số lớn nhất có 3 chữ số khác nhau là số nào?",
            options: ["987", "999", "989", "897"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tieng-viet-2",
        subjectName: "Tiếng Việt 2",
        icon: "📚",
        questions: [
          {
            id: "tv2_01",
            question: "Từ nào dưới đây là từ chỉ hoạt động?",
            options: ["Chạy nhảy", "Bông hoa", "Xanh biếc", "Ngôi trường"],
            correct: 0
          },
          {
            id: "tv2_02",
            question: "Từ nào dưới đây là từ chỉ đặc điểm?",
            options: ["Chăm chỉ", "Học sinh", "Đọc sách", "Quét nhà"],
            correct: 0
          },
          {
            id: "tv2_03",
            question: "Cuối câu hỏi cần đặt dấu câu nào?",
            options: ["Dấu chấm hỏi (?)", "Dấu chấm (.)", "Dấu than (!)", "Dấu phẩy (,)"],
            correct: 0
          },
          {
            id: "tv2_04",
            question: "Trong câu: \"Bạn Lan là học sinh chăm ngoan.\", câu này thuộc kiểu câu gì?",
            options: ["Ai là gì?", "Ai làm gì?", "Ai thế nào?", "Cầu khiến"],
            correct: 0
          },
          {
            id: "tv2_05",
            question: "Tìm từ viết đúng chính tả:",
            options: ["giản dị", "dản dị", "rản dị", "gản dị"],
            correct: 0
          },
          {
            id: "tv2_06",
            question: "Thành ngữ nào khuyên chúng ta chăm chỉ, kiên trì?",
            options: ["Có công mài sắt, có ngày nên kim", "Uống nước nhớ nguồn", "Lá lành đùm lá rách", "Gần mực thì đen"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tnxh-2",
        subjectName: "Tự nhiên & Xã hội 2",
        icon: "🌍",
        questions: [
          {
            id: "tn2_01",
            question: "Cây xanh cần những yếu tố nào sau đây để sinh sống và phát triển?",
            options: ["Nước, ánh sáng, không khí và chất dinh dưỡng", "Chỉ cần bóng tối", "Chỉ cần nước ngọt", "Không cần ánh sáng"],
            correct: 0
          },
          {
            id: "tn2_02",
            question: "Một năm có 4 mùa, đó là các mùa nào?",
            options: ["Xuân, Hạ, Thu, Đông", "Mưa, Nắng, Lạnh, Gió", "Đông, Xuân, Hè, Mát", "Xuân, Thu, Mưa, Lũ"],
            correct: 0
          },
          {
            id: "tn2_03",
            question: "Nghề nào chuyên chăm sóc và chữa bệnh cho mọi người?",
            options: ["Bác sĩ", "Thợ may", "Kỹ sư xây dựng", "Lái xe buýt"],
            correct: 0
          },
          {
            id: "tn2_04",
            question: "Để phòng tránh bị bỏng khi ở nhà, em không nên làm gì?",
            options: ["Nghịch nước sôi hoặc lửa", "Uống nước lọc nguội", "Rửa tay bằng xà phòng", "Xem hoạt hình"],
            correct: 0
          }
        ]
      }
    ]
  },

  // ==========================================
  // KHỐI LỚP 3
  // ==========================================
  {
    grade: 3,
    gradeTitle: "Khối Lớp 3",
    description: "Bộ câu hỏi bồi dưỡng: Bảng nhân chia 6-9, chu vi/diện tích, biện pháp tu từ, cơ quan cơ thể, Tiếng Anh",
    subjects: [
      {
        subjectId: "toan-3",
        subjectName: "Toán 3",
        icon: "📊",
        questions: [
          {
            id: "t3_01",
            question: "Kết quả của phép nhân: 7 x 8 = ?",
            options: ["56", "54", "49", "63"],
            correct: 0
          },
          {
            id: "t3_02",
            question: "Kết quả của phép chia: 72 : 9 = ?",
            options: ["8", "7", "9", "6"],
            correct: 0
          },
          {
            id: "t3_03",
            question: "Một hình vuông có cạnh dài 5 cm. Chu vi của hình vuông đó là bao nhiêu?",
            options: ["20 cm", "25 cm", "15 cm", "10 cm"],
            correct: 0,
            hint: "Chu vi hình vuông = cạnh x 4"
          },
          {
            id: "t3_04",
            question: "Một hình chữ nhật có chiều dài 8 cm, chiều rộng 5 cm. Diện tích của hình chữ nhật là:",
            options: ["40 cm²", "26 cm²", "13 cm²", "35 cm²"],
            correct: 0,
            hint: "Diện tích = dài x rộng"
          },
          {
            id: "t3_05",
            question: "Số gồm 4 nghìn, 3 trăm và 5 đơn vị viết là:",
            options: ["4305", "4350", "4035", "435"],
            correct: 0
          },
          {
            id: "t3_06",
            question: "Giá trị của biểu thức: 100 - 20 x 3 là:",
            options: ["40", "240", "60", "80"],
            correct: 0,
            hint: "Thực hiện phép nhân trước: 20 x 3 = 60, sau đó 100 - 60 = 40"
          },
          {
            id: "t3_07",
            question: "Một năm nhuận có bao nhiêu ngày?",
            options: ["366 ngày", "365 ngày", "360 ngày", "364 ngày"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tieng-viet-3",
        subjectName: "Tiếng Việt 3",
        icon: "📝",
        questions: [
          {
            id: "tv3_01",
            question: "Câu: \"Mặt trời đỏ ửng như quả cầu lửa.\" sử dụng biện pháp nghệ thuật gì?",
            options: ["So sánh", "Nhân hóa", "Điệp từ", "Đảo ngữ"],
            correct: 0
          },
          {
            id: "tv3_02",
            question: "Câu: \"Bác kim giờ bước đi từng bước chậm chạp.\" sử dụng biện pháp gì?",
            options: ["Nhân hóa", "So sánh", "Ẩn dụ", "Nói quá"],
            correct: 0
          },
          {
            id: "tv3_03",
            question: "Từ nào sau đây viết SAI chính tả?",
            options: ["sắp sếp", "ngăn nắp", "sạch sẽ", "gọn gàng"],
            correct: 0,
            hint: "Đúng phải là \"sắp xếp\""
          },
          {
            id: "tv3_04",
            question: "Dấu hai chấm (:) trong câu có tác dụng gì?",
            options: ["Báo hiệu phần giải thích hoặc lời nói nhân vật", "Kết thúc câu", "Để ngắt các vế câu", "Hỏi thông tin"],
            correct: 0
          },
          {
            id: "tv3_05",
            question: "Từ nào đồng nghĩa với từ \"Tổ quốc\"?",
            options: ["Đất nước", "Thành phố", "Làng xóm", "Gia đình"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "khoa-hoc-3",
        subjectName: "Tự nhiên & Xã hội 3",
        icon: "🔬",
        questions: [
          {
            id: "kh3_01",
            question: "Cơ quan nào trong cơ thể người có nhiệm vụ vận chuyển máu đi khắp cơ thể?",
            options: ["Cơ quan tuần hoàn (Tim và mạch máu)", "Cơ quan tiêu hóa", "Cơ quan hô hấp", "Cơ quan bài tiết"],
            correct: 0
          },
          {
            id: "kh3_02",
            question: "Cơ quan hô hấp có chức năng gì?",
            options: ["Lấy khí ô-xi và thải khí các-bô-níc", "Nghiền nát thức ăn", "Lọc máu tạo nước tiểu", "Điều khiển hoạt động"],
            correct: 0
          },
          {
            id: "kh3_03",
            question: "Trái Đất quay xung quanh thiên thể nào?",
            options: ["Mặt Trời", "Mặt Trăng", "Sao Hỏa", "Sao Kim"],
            correct: 0
          },
          {
            id: "kh3_04",
            question: "Bộ não nằm ở đâu và thuộc cơ quan nào?",
            options: ["Nằm trong hộp sọ, thuộc cơ quan thần kinh", "Nằm ở lồng ngực, thuộc cơ quan tuần hoàn", "Nằm ở bụng, thuộc tiêu hóa", "Nằm ở cổ"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "tieng-anh-3",
        subjectName: "Tiếng Anh 3",
        icon: "🇬🇧",
        questions: [
          {
            id: "en3_01",
            question: "How do you say \"Xin chào\" in English?",
            options: ["Hello", "Goodbye", "Thank you", "Sorry"],
            correct: 0
          },
          {
            id: "en3_02",
            question: "\"How old are you?\" means:",
            options: ["Bạn bao nhiêu tuổi?", "Bạn tên là gì?", "Bạn khỏe không?", "Bạn ở đâu?"],
            correct: 0
          },
          {
            id: "en3_03",
            question: "Choose the correct color: The sun is ...",
            options: ["yellow", "blue", "green", "pink"],
            correct: 0
          },
          {
            id: "en3_04",
            question: "What is this? 📖",
            options: ["A book", "A pen", "A ruler", "A rubber"],
            correct: 0
          }
        ]
      }
    ]
  },

  // ==========================================
  // KHỐI LỚP 4
  // ==========================================
  {
    grade: 4,
    gradeTitle: "Khối Lớp 4",
    description: "Bộ câu hỏi bồi dưỡng: Phân số, trung bình cộng, danh-động-tính từ, Khoa học 4, Lịch sử - Địa lý 4",
    subjects: [
      {
        subjectId: "toan-4",
        subjectName: "Toán 4",
        icon: "📈",
        questions: [
          {
            id: "t4_01",
            question: "Tìm số trung bình cộng của các số: 10, 20, 30",
            options: ["20", "25", "15", "30"],
            correct: 0,
            hint: "(10 + 20 + 30) : 3 = 60 : 3 = 20"
          },
          {
            id: "t4_02",
            question: "Rút gọn phân số 15/25 về phân số tối giản được:",
            options: ["3/5", "1/5", "5/3", "3/25"],
            correct: 0,
            hint: "Chia cả tử và mẫu cho 5"
          },
          {
            id: "t4_03",
            question: "Kết quả của phép tính: 2/7 + 3/7 = ?",
            options: ["5/7", "5/14", "6/7", "1/7"],
            correct: 0
          },
          {
            id: "t4_04",
            question: "1 thế kỉ bằng bao nhiêu năm?",
            options: ["100 năm", "10 năm", "1000 năm", "50 năm"],
            correct: 0
          },
          {
            id: "t4_05",
            question: "Năm 1010 thuộc thế kỉ thứ mấy?",
            options: ["Thế kỉ XI", "Thế kỉ X", "Thế kỉ XII", "Thế kỉ IX"],
            correct: 0
          },
          {
            id: "t4_06",
            question: "Hình bình hành có diện tích 48 cm², chiều cao 6 cm. Độ dài đáy tương ứng là:",
            options: ["8 cm", "7 cm", "9 cm", "12 cm"],
            correct: 0,
            hint: "Đáy = Diện tích : Chiều cao = 48 : 6 = 8 cm"
          },
          {
            id: "t4_07",
            question: "Số nào sau đây chia hết cho cả 2 và 5?",
            options: ["120", "125", "122", "123"],
            correct: 0,
            hint: "Số chia hết cho cả 2 và 5 có chữ số tận cùng là 0"
          }
        ]
      },
      {
        subjectId: "tieng-viet-4",
        subjectName: "Tiếng Việt 4",
        icon: "🖋️",
        questions: [
          {
            id: "tv4_01",
            question: "Từ nào sau đây là Danh từ?",
            options: ["Học sinh", "Chăm chỉ", "Chạy nhanh", "Đẹp đẽ"],
            correct: 0
          },
          {
            id: "tv4_02",
            question: "Trong câu: \"Đoàn thuyền đánh cá buồm căng gió.\", bộ phận vị ngữ là:",
            options: ["buồm căng gió", "Đoàn thuyền đánh cá", "căng gió", "đánh cá"],
            correct: 0
          },
          {
            id: "tv4_03",
            question: "Từ láy nào gợi tả tiếng cười?",
            options: ["Khúc khích", "Róc rách", "Lanh lảnh", "Thì thầm"],
            correct: 0
          },
          {
            id: "tv4_04",
            question: "Thành ngữ nào sau đây thể hiện lòng dũng cảm?",
            options: ["Gan vàng dạ sắt", "Uống nước nhớ nguồn", "Thuận vợ thuận chồng", "Lá lành đùm lá rách"],
            correct: 0
          },
          {
            id: "tv4_05",
            question: "Câu: \"Lan đang đọc sách trong thư viện.\" thuộc kiểu câu kể nào?",
            options: ["Ai làm gì?", "Ai là gì?", "Ai thế nào?", "Cầu khiến"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "khoa-hoc-4",
        subjectName: "Khoa học 4",
        icon: "🧪",
        questions: [
          {
            id: "kh4_01",
            question: "Nước tồn tại ở những thể nào?",
            options: ["Thể rắn, thể lỏng, thể khí", "Chỉ có thể lỏng", "Chỉ có thể rắn và lỏng", "Thể khí và thể sương"],
            correct: 0
          },
          {
            id: "kh4_02",
            question: "Không khí có những tính chất nào sau đây?",
            options: ["Trong suốt, không màu, không mùi, không vị, không có hình dạng nhất định", "Có màu trắng, mùi thơm", "Có hình vuông", "Có vị ngọt"],
            correct: 0
          },
          {
            id: "kh4_03",
            question: "Chất dinh dưỡng nào giúp xây dựng và phát triển cơ bắp, cơ thể?",
            options: ["Chất đạm (Protein)", "Chất đường bột", "Chất béo", "Vitamin"],
            correct: 0
          },
          {
            id: "kh4_04",
            question: "Vật nào sau đây là vật tự phát sáng?",
            options: ["Mặt Trời", "Mặt Trăng", "Tấm gương phẳng", "Mặt hồ nước"],
            correct: 0,
            hint: "Mặt Trăng chỉ phản chiếu ánh sáng từ Mặt Trời"
          }
        ]
      },
      {
        subjectId: "ls-dl-4",
        subjectName: "Lịch sử & Địa lý 4",
        icon: "🗺️",
        questions: [
          {
            id: "ls4_01",
            question: "Năm 938, Ngô Quyền đã đánh tan quân Nam Hán trên con sông nào?",
            options: ["Sông Bạch Đằng", "Sông Hồng", "Sông Mê Kông", "Sông Hương"],
            correct: 0
          },
          {
            id: "ls4_02",
            question: "Năm 1010, vua Lý Thái Tổ đã dời đô từ Hoa Lư về đâu?",
            options: ["Đại La (Thăng Long - Hà Nội)", "Cổ Loa", "Phú Xuân (Huế)", "Gia Định"],
            correct: 0
          },
          {
            id: "dl4_01",
            question: "Dãy núi nào cao và đồ sộ nhất Việt Nam có đỉnh Phan-xi-păng?",
            options: ["Dãy Hoàng Liên Sơn", "Dãy Trường Sơn Bắc", "Dãy Trường Sơn Nam", "Dãy Bạch Mã"],
            correct: 0
          },
          {
            id: "dl4_02",
            question: "Đồng bằng lớn nhất nước ta là đồng bằng nào?",
            options: ["Đồng bằng Nam Bộ", "Đồng bằng Bắc Bộ", "Đồng bằng duyên hải miền Trung", "Đồng bằng sông Mã"],
            correct: 0
          }
        ]
      }
    ]
  },

  // ==========================================
  // KHỐI LỚP 5
  // ==========================================
  {
    grade: 5,
    gradeTitle: "Khối Lớp 5",
    description: "Bộ câu hỏi ôn tập chuyển cấp: Số thập phân, tỉ số %, từ đồng nghĩa/trái nghĩa, Lịch sử - Địa lý 5, Khoa học 5",
    subjects: [
      {
        subjectId: "toan-5",
        subjectName: "Toán 5",
        icon: "🧮",
        questions: [
          {
            id: "t5_01",
            question: "Viết phân số 3/4 dưới dạng số thập phân là:",
            options: ["0,75", "0,34", "0,43", "7,5"],
            correct: 0
          },
          {
            id: "t5_02",
            question: "Tìm 25% của 200 kg:",
            options: ["50 kg", "25 kg", "100 kg", "75 kg"],
            correct: 0,
            hint: "200 x 25 : 100 = 50 kg"
          },
          {
            id: "t5_03",
            question: "Một hình tròn có bán kính r = 3 cm. Diện tích của hình tròn đó là:",
            options: ["28,26 cm²", "18,84 cm²", "9,42 cm²", "12,56 cm²"],
            correct: 0,
            hint: "S = r x r x 3,14 = 3 x 3 x 3,14 = 28,26"
          },
          {
            id: "t5_04",
            question: "Công thức tính vận tốc trong chuyển động đều là gì?",
            options: ["v = s : t", "v = s x t", "v = t : s", "v = (s + t) : 2"],
            correct: 0
          },
          {
            id: "t5_05",
            question: "Một ô tô đi được quãng đường 120 km trong thời gian 2 giờ. Vận tốc của ô tô là:",
            options: ["60 km/giờ", "50 km/giờ", "70 km/giờ", "240 km/giờ"],
            correct: 0,
            hint: "v = 120 : 2 = 60 km/h"
          },
          {
            id: "t5_06",
            question: "Kết quả của phép tính: 3,5 x 100 = ?",
            options: ["350", "35", "3500", "0,35"],
            correct: 0
          },
          {
            id: "t5_07",
            question: "Thể tích của hình lập phương có cạnh 4 dm là:",
            options: ["64 dm³", "16 dm³", "96 dm³", "48 dm³"],
            correct: 0,
            hint: "V = a x a x a = 4 x 4 x 4 = 64"
          }
        ]
      },
      {
        subjectId: "tieng-viet-5",
        subjectName: "Tiếng Việt 5",
        icon: "📜",
        questions: [
          {
            id: "tv5_01",
            question: "Cặp từ nào dưới đây là cặp từ đồng âm?",
            options: ["bàn cờ - bàn bạc", "chăm chỉ - siêng năng", "cao - thấp", "mênh mông - bao la"],
            correct: 0,
            hint: "\"bàn\" (đồ vật) và \"bàn\" (trao đổi ý kiến) phát âm giống nhau nhưng nghĩa hoàn toàn khác nhau"
          },
          {
            id: "tv5_02",
            question: "Cặp từ nào dưới đây là cặp từ trái nghĩa?",
            options: ["Đoàn kết - chia rẽ", "Chăm chỉ - cần cù", "Thông minh - sáng dạ", "Bao la - rộng lớn"],
            correct: 0
          },
          {
            id: "tv5_03",
            question: "Trong câu ghép: \"Vì trời mưa to nên đường rất trơn.\", cặp quan hệ từ biểu thị quan hệ gì?",
            options: ["Nguyên nhân - kết quả", "Điều kiện - kết quả", "Tương phản", "Tăng tiến"],
            correct: 0
          },
          {
            id: "tv5_04",
            question: "Từ \"ăn\" trong câu nào dưới đây mang nghĩa chuyển?",
            options: ["Tàu vào cảng ăn than.", "Bé đang ăn cơm.", "Cả nhà ăn tối vui vẻ.", "Mèo ăn cá."],
            correct: 0
          },
          {
            id: "tv5_05",
            question: "Đại từ xưng hô nào thể hiện sự tôn trọng, trang nghiêm?",
            options: ["Kính thưa quý thầy cô", "Mày - tao", "Nó - chúng nó", "Cậu - tớ"],
            correct: 0
          }
        ]
      },
      {
        subjectId: "khoa-hoc-5",
        subjectName: "Khoa học 5",
        icon: "🛰️",
        questions: [
          {
            id: "kh5_01",
            question: "Nguồn năng lượng nào sau đây là nguồn năng lượng sạch, tái tạo được?",
            options: ["Năng lượng mặt trời và gió", "Than đá", "Dầu mỏ", "Khí đốt tự nhiên"],
            correct: 0
          },
          {
            id: "kh5_02",
            question: "Hiện tượng chất này biến đổi thành chất khác được gọi là hiện tượng gì?",
            options: ["Hiện tượng hóa học", "Hiện tượng vật lý", "Hiện tượng cơ học", "Hiện tượng quang học"],
            correct: 0
          },
          {
            id: "kh5_03",
            question: "Hành động nào sau đây góp phần tích cực bảo vệ môi trường?",
            options: ["Trồng cây gây rừng và phân loại rác thải", "Vứt rác bừa bãi ra sông suối", "Đốt rác nhựa độc hại", "Sử dụng nhiều túi nilon một lần"],
            correct: 0
          },
          {
            id: "kh5_04",
            question: "Loài động vật nào sau đây đẻ con và nuôi con bằng sữa mẹ?",
            options: ["Cá voi", "Cá chép", "Đà điểu", "Rùa biển"],
            correct: 0,
            hint: "Cá voi là động vật có vú, đẻ con và nuôi con bằng sữa mẹ"
          }
        ]
      },
      {
        subjectId: "ls-dl-5",
        subjectName: "Lịch sử & Địa lý 5",
        icon: "🏛️",
        questions: [
          {
            id: "ls5_01",
            question: "Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình vào ngày tháng năm nào?",
            options: ["2 tháng 9 năm 1945", "19 tháng 8 năm 1945", "30 tháng 4 năm 1975", "7 tháng 5 năm 1954"],
            correct: 0
          },
          {
            id: "ls5_02",
            question: "Chiến dịch Điện Biên Phủ toàn thắng vào ngày nào?",
            options: ["7 tháng 5 năm 1954", "30 tháng 4 năm 1975", "19 tháng 5 năm 1890", "22 tháng 12 năm 1944"],
            correct: 0
          },
          {
            id: "dl5_01",
            question: "Việt Nam nằm ở khu vực nào của châu Á?",
            options: ["Đông Nam Á", "Đông Bắc Á", "Tây Nam Á", "Trung Á"],
            correct: 0
          },
          {
            id: "dl5_02",
            question: "Châu lục nào có diện tích và dân số lớn nhất thế giới?",
            options: ["Châu Á", "Châu Phi", "Châu Âu", "Châu Mỹ"],
            correct: 0
          },
          {
            id: "dl5_03",
            question: "Vùng biển Việt Nam là một phần của biển nào?",
            options: ["Biển Đông", "Biển Đen", "Biển Baltic", "Biển Đỏ"],
            correct: 0
          }
        ]
      }
    ]
  }
];

/**
 * Xuất bộ câu hỏi sang định dạng StudyAI chuẩn:
 * `Câu hỏi | Đáp án đúng | Sai 1 | Sai 2 | Sai 3`
 */
export function exportToStudyAiFormat(questions: Question[]): string {
  return questions
    .map(q => {
      const correctText = q.options[q.correct];
      const wrongs = q.options.filter((_, i) => i !== q.correct);
      return [q.question, correctText, ...wrongs].join(" | ");
    })
    .join("\n");
}
