import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courses } from "../../data/courses";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user, logout, enrollCourse } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleEnrollCourse = (courseId) => {
    enrollCourse(courseId);
  };

  const getCourseProgress = (courseId) => {
    const progress = user.coursesProgress[courseId];
    if (!progress) return 0;
    return Math.round((progress.completedLessons.length / progress.totalLessons) * 100);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Панель управления</h1>
          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <button onClick={handleLogout} className="btn-logout">
              Выход
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          onClick={() => navigate("/dashboard")}
          className="nav-btn active"
        >
          Главная
        </button>
        <button 
          onClick={() => navigate("/courses")}
          className="nav-btn"
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

      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Добро пожаловать, {user.fullName}!</h2>
          <p>Выберите курс для начала обучения и отслеживайте свой прогресс.</p>
        </section>

        <section className="courses-section">
          <h3>Мои курсы</h3>
          <div className="courses-grid">
            {courses.map((course) => {
              const progress = getCourseProgress(course.id);
              const isEnrolled = user.enrolledCourses.includes(course.id);
              
              return (
                <div key={course.id} className="course-card">
                  <div className="course-header">
                    <h4>{course.title}</h4>
                  </div>

                  <div className="course-info">
                    <p className="lesson-count">
                      Уроков: {course.lessons.length}
                    </p>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{progress}%</span>
                  </div>

                  <div className="course-actions">
                    {!isEnrolled ? (
                      <button
                        onClick={() => handleEnrollCourse(course.id)}
                        className="btn-enroll"
                      >
                        Начать курс
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="btn-continue"
                      >
                        Продолжить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
