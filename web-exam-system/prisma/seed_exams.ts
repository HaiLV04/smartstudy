/**
 * Script Seed nạp toàn bộ đề thi & câu hỏi Lớp 1 - 5 vào Cơ sở dữ liệu Prisma
 * Chạy lệnh: npx tsx seed_exams.ts (hoặc đưa vào prisma/seed.ts)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('--- BẮT ĐẦU SEED ĐỀ THI LỚP 1 ĐẾN LỚP 5 ---');

  const jsonPath = path.join(__dirname, '../data/exams.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const exams = JSON.parse(rawData);

  for (const examData of exams) {
    console.log(`Đang nạp đề: ${examData.title} (Lớp ${examData.grade})`);

    // Tạo đề thi
    const exam = await prisma.exam.upsert({
      where: { slug: examData.slug },
      update: {
        title: examData.title,
        grade: examData.grade,
        subject: examData.subject,
        subjectName: examData.subjectName,
        semester: examData.semester,
        durationMinutes: examData.durationMinutes,
        totalPoints: examData.totalPoints,
        description: examData.description,
        difficulty: examData.difficulty,
      },
      create: {
        slug: examData.slug,
        title: examData.title,
        grade: examData.grade,
        subject: examData.subject,
        subjectName: examData.subjectName,
        semester: examData.semester,
        durationMinutes: examData.durationMinutes,
        totalPoints: examData.totalPoints,
        description: examData.description,
        difficulty: examData.difficulty,
      },
    });

    // Tạo câu hỏi và các lựa chọn đáp án
    for (const q of examData.questions) {
      const question = await prisma.question.create({
        data: {
          examId: exam.id,
          questionNumber: q.questionNumber,
          content: q.content,
          type: q.type,
          points: q.points,
          difficulty: q.difficulty,
          explanation: q.explanation || null,
          options: {
            create: q.options.map((opt: any) => ({
              key: opt.key,
              content: opt.content,
              isCorrect: opt.isCorrect,
            })),
          },
        },
      });
    }
  }

  console.log('--- HOÀN THÀNH SEED DỮ LIỆU ĐỀ THI THÀNH CÔNG! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
