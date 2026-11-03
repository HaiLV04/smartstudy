const fs = require('fs');

// Read TypeScript file and extract object or run ts-node/clean parsing
const tsContent = fs.readFileSync('F:/Hoài thanh/studyai-nextjs-3d/data/questionBanks.ts', 'utf8');

// Strip TypeScript interfaces and export keywords
const jsContent = tsContent
  .replace(/export interface[\s\S]*?}\n/g, '')
  .replace(/export const QUESTION_BANKS: GradeBank\[\] =/, 'const QUESTION_BANKS =')
  .replace(/export function exportToStudyAiFormat[\s\S]*$/, `
function exportToStudyAiFormat(questions) {
  return questions
    .map(q => {
      const correctText = q.options[q.correct];
      const wrongs = q.options.filter((_, i) => i !== q.correct);
      return [q.question, correctText, ...wrongs].join(" | ");
    })
    .join("\\n");
}
module.exports = { QUESTION_BANKS, exportToStudyAiFormat };
`);

fs.writeFileSync('F:/Hoài thanh/studyai-nextjs-3d/data/questionBanks.js', jsContent, 'utf8');

const { QUESTION_BANKS, exportToStudyAiFormat } = require('F:/Hoài thanh/studyai-nextjs-3d/data/questionBanks.js');

console.log('Writing exported files...');
fs.writeFileSync('F:/Hoài thanh/Bo_De_Cau_Hoi_Lop_1_den_5.json', JSON.stringify(QUESTION_BANKS, null, 2), 'utf8');

let textDoc = `# BỘ ĐỀ VÀ NGÂN HÀNG CÂU HỎI TƯƠNG TÁC CHO CÁC KHỐI LỚP 1 ĐẾN 5
# Định dạng chuẩn StudyAI (Dùng trực tiếp cho 48 trò chơi hoặc in ấn)
# Cú pháp: Câu hỏi | Đáp án đúng | Đáp án sai 1 | Đáp án sai 2 | Đáp án sai 3
========================================================================

`;

QUESTION_BANKS.forEach(gb => {
  textDoc += `\n\n########################################################################\n`;
  textDoc += `### ${gb.gradeTitle.toUpperCase()} - ${gb.description}\n`;
  textDoc += `########################################################################\n`;
  gb.subjects.forEach(sub => {
    textDoc += `\n--- [${sub.icon} ${sub.subjectName}] ---\n`;
    textDoc += exportToStudyAiFormat(sub.questions);
    textDoc += `\n`;
  });
});

fs.writeFileSync('F:/Hoài thanh/Bo_De_StudyAI_Format_Lop_1_den_5.txt', textDoc, 'utf8');
console.log('Exported files successfully to F:/Hoài thanh:');
console.log('1. F:/Hoài thanh/Bo_De_Cau_Hoi_Lop_1_den_5.json');
console.log('2. F:/Hoài thanh/Bo_De_StudyAI_Format_Lop_1_den_5.txt');
