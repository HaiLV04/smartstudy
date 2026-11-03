import { Question } from "@/data/questionBanks";

export interface ParsedQuiz {
  items: Question[];
}

export const Storage = {
  parseStudyAiText(text: string): Question[] {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const questions: Question[] = [];

    lines.forEach((line, index) => {
      // Support split by "|"
      const parts = line.split("|").map(s => s.trim()).filter(s => s.length > 0);
      if (parts.length >= 3) {
        const [q, correct, ...wrongs] = parts;
        questions.push({
          id: `custom_${index + 1}`,
          question: q,
          options: [correct, ...wrongs],
          correct: 0
        });
      }
    });

    return questions;
  },

  toStudyAiText(questions: Question[]): string {
    return questions
      .map(q => {
        const correctText = q.options[q.correct] || q.options[0];
        const wrongs = q.options.filter((_, i) => i !== q.correct);
        return [q.question, correctText, ...wrongs].join(" | ");
      })
      .join("\n");
  },

  saveQuiz(key: string, questions: Question[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`sa_3d_quiz_${key}`, JSON.stringify(questions));
    } catch (e) {
      console.error(e);
    }
  },

  loadQuiz(key: string, fallback: Question[]): Question[] {
    if (typeof window === 'undefined') return fallback;
    try {
      const data = localStorage.getItem(`sa_3d_quiz_${key}`);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  },

  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  shuffleOptions(question: Question): Question {
    const correctText = question.options[question.correct];
    const shuffledOpts = this.shuffle(question.options);
    return {
      ...question,
      options: shuffledOpts,
      correct: shuffledOpts.indexOf(correctText)
    };
  }
};
