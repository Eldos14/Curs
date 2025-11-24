import React from "react";
import { useAuth } from "../../context/AuthContext";
import { courses } from "../../data/courses";
import "../styles/CoursePage.css";

function TestHistory() {
  const { user } = useAuth();

  if (!user) return null;

  const rows = [];

  Object.keys(user.coursesProgress || {}).forEach((courseId) => {
    const course = courses.find((c) => c.id === courseId);
    const progress = user.coursesProgress[courseId] || {};
    const tests = progress.tests || {};

    Object.keys(tests).forEach((lessonId) => {
      const lesson = course?.lessons?.find((l) => String(l.id) === String(lessonId));
      const data = tests[lessonId];
      rows.push({ courseId, courseTitle: course?.title || courseId, lessonId, lessonTitle: lesson?.title || `Урок ${lessonId}`, data });
    });
  });

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto" }}>
      <h2>История тестов</h2>
      {rows.length === 0 ? (
        <div>Пока нет сохранённых результатов тестов.</div>
      ) : (
        <div className="history-list" style={{ marginTop: 12 }}>
          {rows.map((r, idx) => (
            <div key={idx} className="lesson-test" style={{ marginBottom: 18, paddingBottom: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.courseTitle}</strong> — {r.lessonTitle}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800 }}>{r.data.score}%</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{new Date(r.data.date).toLocaleString()}</div>
                </div>
              </div>
              {/* Детализация попытки: ответы пользователя и правильные варианты */}
              {r.data.answers && r.data.total && r.data.answers && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Ответы пользователя:</div>
                  {(courses.find(c => c.id === r.courseId)?.lessons.find(l => String(l.id) === String(r.lessonId))?.test || []).map((q, qIdx) => {
                    const userAnswerIdx = r.data.answers[q.id];
                    const isCorrect = userAnswerIdx === q.correct;
                    return (
                      <div key={q.id} style={{ marginBottom: 4, paddingLeft: 8 }}>
                        <span style={{ fontWeight: 500 }}>{qIdx + 1}. {q.question}</span><br/>
                        <span style={{ color: isCorrect ? 'green' : 'crimson', fontWeight: 500 }}>
                          Ваш ответ: {typeof userAnswerIdx === 'number' ? q.options[userAnswerIdx] : <em>не выбран</em>} {isCorrect ? '✓' : '✗'}
                        </span><br/>
                        <span style={{ color: '#555', fontSize: 13 }}>
                          Правильный ответ: {q.options[q.correct]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestHistory;
