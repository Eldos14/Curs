import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courses } from "../../data/courses";
import "../styles/Courses.css";

function Courses() {
  const { user, logout, enrollCourse } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleEnrollCourse = (courseId) => {
    enrollCourse(courseId);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getCourseProgress = (courseId) => {
    const progress = user.coursesProgress[courseId];
    if (!progress) return 0;
    return Math.round((progress.completedLessons.length / progress.totalLessons) * 100);
  };

  return (
    <div className="courses-container">
      <header className="courses-header">
        <div className="header-content">
          <h1>Курсы обучения</h1>
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Выход
            </button>
          </div>
        </div>
      </header>

      <nav className="courses-nav">
        <button 
          onClick={() => navigate("/dashboard")}
          className="nav-btn"
        >
          Главная
        </button>
        <button 
          onClick={() => navigate("/courses")}
          className="nav-btn active"
        >
          Курсы
        </button>
        <button 
          onClick={() => navigate("/profile")}
          className="nav-btn"
        >
          Профиль
        </button>
      </nav>

      <main className="courses-main">
        <section className="courses-grid">
          {courses.map((course) => {
            const progress = getCourseProgress(course.id);
            const isEnrolled = user.enrolledCourses.includes(course.id);
            
            return (
              <div key={course.id} className="course-card-full">
                <div className="card-header">
                  <h3>{course.title}</h3>
                </div>

                <div className="card-content">
                  <div className="lessons-info">
                    <h4>Содержание курса:</h4>
                    <ul className="lessons-list">
                      {course.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <span className="lesson-number">Урок {lesson.id}</span>
                          <span className="lesson-title">{lesson.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="course-stats">
                    <div className="stat">
                      <span className="stat-label">Всего уроков:</span>
                      <span className="stat-value">{course.lessons.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Прогресс:</span>
                      <span className="stat-value">{progress}%</span>
                    </div>
                  </div>

                  <div className="progress-bar-section">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="card-actions">
                    {!isEnrolled ? (
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        className="btn-start-course"
                      >
                        Начать обучение
                      </button>
                    ) : progress === 100 ? (
                      <div className="course-completed">
                        <span className="completed-badge">✓ Курс завершен</span>
                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="btn-review"
                        >
                          Повторить
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="btn-continue-course"
                      >
                        Продолжить обучение
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default Courses;
