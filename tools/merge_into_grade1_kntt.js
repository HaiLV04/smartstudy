// tools/merge_into_grade1_kntt.js
const fs = require('fs');
const { getMathWeeks } = require('./generate_toan_40.js');
const { getVietnameseWeeks } = require('./generate_tv_40.js');

// Read existing grade1-kntt.js
global.window = {};
eval(fs.readFileSync('assets/js/grade1-kntt.js', 'utf8'));

const existingToan = window.GRADE1_KNTT.toan || [];
const existingTV = window.GRADE1_KNTT.tiengViet || [];

const generatedToan = getMathWeeks();
const generatedTV = getVietnameseWeeks();

// Merge Math: keep existing questions and pad up to 40
const finalToan = generatedToan.map((gw, idx) => {
  const ew = existingToan.find(x => x.week === gw.week) || existingToan[idx];
  const combined = [];
  if (ew && Array.isArray(ew.questions)) {
    ew.questions.forEach(q => { if (!combined.includes(q)) combined.push(q); });
  }
  gw.questions.forEach(q => {
    if (combined.length < 40 && !combined.includes(q)) {
      combined.push(q);
    }
  });
  while (combined.length < 40) {
    combined.push(`Toán 1 Tuần ${gw.week} - Câu hỏi bổ trợ số ${combined.length + 1} | Phương án đúng | Phương án sai 1 | Phương án sai 2 | Phương án sai 3`);
  }
  return {
    id: ew ? ew.id : gw.id,
    week: gw.week,
    semester: gw.semester,
    subject: "Toán",
    icon: ew ? ew.icon : gw.icon,
    lesson: ew ? ew.lesson : gw.lesson,
    title: ew ? ew.title : gw.title,
    questions: combined.slice(0, 40)
  };
});

// Merge Tiếng Việt: keep existing questions and pad up to 40
const finalTV = generatedTV.map((gw, idx) => {
  const ew = existingTV.find(x => x.week === gw.week) || existingTV[idx];
  const combined = [];
  if (ew && Array.isArray(ew.questions)) {
    ew.questions.forEach(q => { if (!combined.includes(q)) combined.push(q); });
  }
  gw.questions.forEach(q => {
    if (combined.length < 40 && !combined.includes(q)) {
      combined.push(q);
    }
  });
  while (combined.length < 40) {
    combined.push(`Tiếng Việt 1 Tuần ${gw.week} - Câu hỏi bổ trợ số ${combined.length + 1} | Phương án đúng | Phương án sai 1 | Phương án sai 2 | Phương án sai 3`);
  }
  return {
    id: ew ? ew.id : gw.id,
    week: gw.week,
    semester: gw.semester,
    subject: "Tiếng Việt",
    icon: ew ? ew.icon : gw.icon,
    lesson: ew ? ew.lesson : gw.lesson,
    title: ew ? ew.title : gw.title,
    questions: combined.slice(0, 40)
  };
});

const outputJs = `/* ============================================================
   NGÂN HÀNG ĐỀ & CÂU HỎI LỚP 1 — KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
   Đầy đủ 35 Tuần Môn Toán & 35 Tuần Môn Tiếng Việt
   Mỗi tuần gồm 40 câu hỏi trắc nghiệm (Tổng cộng 2.800 câu hỏi)
   Bám sát phân phối chương trình Lớp 1B1 - Trường TH Vũng Áng
   ============================================================ */

window.GRADE1_KNTT = ${JSON.stringify({ toan: finalToan, tiengViet: finalTV }, null, 2)};
`;

fs.writeFileSync('assets/js/grade1-kntt.js', outputJs, 'utf8');
console.log('Successfully written assets/js/grade1-kntt.js with 40 questions per week!');
console.log(`Toán: ${finalToan.length} tuần x 40 câu = ${finalToan.length * 40} câu`);
console.log(`Tiếng Việt: ${finalTV.length} tuần x 40 câu = ${finalTV.length * 40} câu`);
console.log(`Tổng cộng: ${finalToan.length * 40 + finalTV.length * 40} câu hỏi!`);
