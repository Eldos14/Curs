import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courses } from "../../data/courses";
import "../styles/CoursePage.css";

function CoursePage() {
  const { id } = useParams();
  const { user, logout, markLessonComplete, saveTestResult } = useAuth();
  const navigate = useNavigate();
  const [currentLessonId, setCurrentLessonId] = useState(1);

  if (!user) {
    navigate("/login");
    return null;
  }

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return <div className="error">Курс не найден</div>;
  }

  const currentLesson = course.lessons.find((l) => l.id === currentLessonId);
  const progress = user.coursesProgress[id];
  const progressPercentage = Math.round(
    (progress.completedLessons.length / progress.totalLessons) * 100
  );

  const handleCompleteLesson = () => {
    markLessonComplete(id, currentLessonId);
  };

  const handleNextLesson = () => {
    if (currentLessonId < course.lessons.length) {
      setCurrentLessonId(currentLessonId + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonId > 1) {
      setCurrentLessonId(currentLessonId - 1);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isLessonCompleted = progress.completedLessons.includes(currentLessonId);

  // Тест и материалы
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [activeTab, setActiveTab] = useState("materials"); // 'materials' or 'test'

  useEffect(() => {
    // При смене урока загружаем сохранённый результат теста и ответы (если есть)
    const saved = user?.coursesProgress?.[id]?.tests?.[currentLessonId];
    if (saved) {
      setTestResult(saved);
      setAnswers(saved.answers || {});
    } else {
      setTestResult(null);
      setAnswers({});
    }
    // по умолчанию показываем материалы
    setActiveTab("materials");
  }, [id, currentLessonId, user]);

  const handleSelectOption = (qId, optionIndex) => {
    setAnswers((a) => ({ ...a, [qId]: optionIndex }));
  };

  const handleSubmitTest = () => {
    if (!currentLesson.test || currentLesson.test.length === 0) return;
    if (!isLessonCompleted) {
      // защищаем на случай, если вкладка как-то стала активной
      alert('Тест доступен только после просмотра или отметки урока как пройденного.');
      return;
    }
    const total = currentLesson.test.length;
    let correctCount = 0;
    currentLesson.test.forEach((q) => {
      const sel = answers[q.id];
      if (sel === q.correct) correctCount += 1;
    });
    const score = Math.round((correctCount / total) * 100);
    const result = { score, correctCount, total, answers, date: new Date().toISOString() };
    setTestResult(result);
    // сохраняем результат теста в профиль
    saveTestResult(id, currentLessonId, result);

    // если прошли тест >= 70% — отмечаем урок пройденным
    if (score >= 70) {
      markLessonComplete(id, currentLessonId);
    }
  };

  return (
    <div className="course-page-container">
      <header className="course-page-header">
        <div className="header-content">
          <button 
            onClick={() => navigate("/courses")}
            className="btn-back"
          >
            ← Вернуться к курсам
          </button>
          <h1>{course.title}</h1>
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="course-page-content">
        {/* Боковая панель с уроками */}
        <aside className="lessons-sidebar">
          <div className="sidebar-header">
            <h3>Уроки ({course.lessons.length})</h3>
            <div className="overall-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text">{progressPercentage}%</span>
            </div>
          </div>

          <ul className="lessons-list">
            {course.lessons.map((lesson) => {
              const completed = progress.completedLessons.includes(lesson.id);
              const isActive = lesson.id === currentLessonId;
              
              return (
                <li 
                  key={lesson.id}
                  className={`lesson-item ${isActive ? "active" : ""} ${completed ? "completed" : ""}`}
                  onClick={() => setCurrentLessonId(lesson.id)}
                >
                  <span className="lesson-number">
                    {completed ? "✓" : lesson.id}
                  </span>
                  <span className="lesson-title">{lesson.title}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Основной контент */}
        <main className="lesson-content">
          {currentLesson && (
            <>
              <div className="lesson-header">
                <h2>{currentLesson.title}</h2>
                <span className="lesson-number">
                  Урок {currentLesson.id} из {course.lessons.length}
                </span>
              </div>

              {/* Видео плеер */}
              <div className="video-player-container">
                <video 
                  key={currentLesson.id}
                  className="video-player" 
                  controls
                  onEnded={handleCompleteLesson}
                >
                  <source src={currentLesson.video} type="video/mp4" />
                  Ваш браузер не поддерживает воспроизведение видео.
                </video>
              </div>

              {/* Контролы */}
              <div className="lesson-controls">
                <div className="control-group">
                  <button
                    onClick={handlePrevLesson}
                    disabled={currentLessonId === 1}
                    className="btn-control btn-prev"
                  >
                    ← Предыдущий урок
                  </button>

                  <button
                    onClick={handleCompleteLesson}
                    className={`btn-complete ${isLessonCompleted ? "completed" : ""}`}
                  >
                    {isLessonCompleted ? "✓ Урок пройден" : "Отметить как пройден"}
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={currentLessonId === course.lessons.length}
                    className="btn-control btn-next"
                  >
                    Следующий урок →
                  </button>
                </div>
              </div>

              {/* Статистика */}
              <div className="lesson-stats">
                <div className="stat-item">
                  <span className="stat-label">Статус урока:</span>
                  <span className="stat-value">
                    {isLessonCompleted ? "Пройден ✓" : "Не пройден"}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Прогресс курса:</span>
                  <span className="stat-value">{progressPercentage}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Всего пройдено:</span>
                  <span className="stat-value">
                    {progress.completedLessons.length} из {course.lessons.length} уроков
                  </span>
                </div>
              </div>

              {/* Переключатель карточек: Материалы / Тест */}
              <div className="card-toggle" style={{ marginTop: 20 }}>
                <div className="toggle-cards">
                  <button
                    className={`tab ${activeTab === 'materials' ? 'active' : ''}`}
                    onClick={() => setActiveTab('materials')}
                  >
                    Материалы
                  </button>
                  {currentLesson.test && currentLesson.test.length > 0 && (
                    <button
                      className={`tab ${activeTab === 'test' ? 'active' : ''} ${!isLessonCompleted ? 'disabled' : ''}`}
                      onClick={() => {
                        if (!isLessonCompleted) return; // блокируем переключение
                        setActiveTab('test');
                      }}
                      title={!isLessonCompleted ? 'Пройдите урок (воспроизведите видео или отметьте как пройден) чтобы открыть тест' : ''}
                    >
                      Тест
                    </button>
                  )}
                </div>

                {activeTab === 'materials' && currentLesson.materials && (
                  <div className="lesson-materials">
                    <h3>Материалы</h3>
                    <p>{currentLesson.materials}</p>
                  </div>
                )}

                {/* Если урок не пройден — покажем подсказку */}
                {!isLessonCompleted && currentLesson.test && currentLesson.test.length > 0 && (
                  <div style={{ marginTop: 12, color: '#b33' }}>
                    Тест будет доступен после просмотра урока или после нажатия «Отметить как пройден».
                  </div>
                )}

                {activeTab === 'test' && currentLesson.test && currentLesson.test.length > 0 && isLessonCompleted && (
                  <div className="lesson-test">
                    <h3>Тест по уроку</h3>
                    {currentLesson.test.map((q) => (
                      <div key={q.id} className="test-question" style={{ marginBottom: 12 }}>
                        <div className="question-text">{q.question}</div>
                        <div className="question-options">
                          {q.options.map((opt, idx) => (
                            <label key={idx} style={{ display: 'block', marginTop: 6 }}>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={answers[q.id] === idx}
                                onChange={() => handleSelectOption(q.id, idx)}
                              />{' '}
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: 10 }}>
                      <button onClick={handleSubmitTest} className="btn-submit-test">Проверить тест</button>
                      {testResult && (
                        <div style={{ marginTop: 10 }}>
                          <strong>Результат: {testResult.score}%</strong>
                          <div>{testResult.correctCount} из {testResult.total} правильных</div>
                          {testResult.score >= 70 ? (
                            <div style={{ color: 'green' }}>Тест пройден — урок отмечен как пройденный.</div>
                          ) : (
                            <div style={{ color: 'crimson' }}>Тест не пройден — попробуйте ещё раз.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CoursePage;