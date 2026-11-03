import { NextResponse } from 'next/server';
import { EXAMS_DATABASE } from '../data/exams';

// 1. GET: Lấy danh sách đề thi (Có hỗ trợ lọc theo grade và subject)
// Ví dụ: GET /api/exams?grade=1&subject=MATH
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grade = searchParams.get('grade');
  const subject = searchParams.get('subject');

  let results = [...EXAMS_DATABASE];

  if (grade) {
    results = results.filter(e => e.grade === parseInt(grade, 10));
  }

  if (subject) {
    results = results.filter(e => e.subject.toLowerCase() === subject.toLowerCase());
  }

  // Trả về danh sách tóm tắt (không lộ đáp án đúng khi chỉ xem list)
  const summary = results.map(e => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    grade: e.grade,
    subject: e.subject,
    subjectName: e.subjectName,
    semester: e.semester,
    durationMinutes: e.durationMinutes,
    totalPoints: e.totalPoints,
    difficulty: e.difficulty,
    questionCount: e.questions.length,
    description: e.description,
  }));

  return NextResponse.json({
    success: true,
    count: summary.length,
    data: summary,
  });
}

// 2. POST: Nộp bài thi và tự động chấm điểm
// Body gửi lên: { examId: string, answers: { [questionId: string]: string } }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { examId, answers } = body;

    const exam = EXAMS_DATABASE.find(e => e.id === examId);
    if (!exam) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đề thi' }, { status: 404 });
    }

    let correctCount = 0;
    let totalScore = 0;
    const details = [];

    for (const q of exam.questions) {
      const selectedKey = answers ? answers[q.id] : null;
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect = selectedKey === correctOption?.key;

      if (isCorrect) {
        correctCount += 1;
        totalScore += q.points;
      }

      details.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        selectedKey,
        correctKey: correctOption?.key,
        isCorrect,
        points: isCorrect ? q.points : 0,
        explanation: q.explanation,
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        examId: exam.id,
        examTitle: exam.title,
        grade: exam.grade,
        totalQuestions: exam.questions.length,
        correctCount,
        totalScore,
        maxScore: exam.totalPoints,
        percentage: Math.round((totalScore / exam.totalPoints) * 100),
        details,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
