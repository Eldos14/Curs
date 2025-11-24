import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../styles/Profile.css";

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    updateProfile({
      fullName: formData.fullName,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getTotalProgress = () => {
    if (!user.coursesProgress) return 0;
    
    const allCourses = Object.values(user.coursesProgress);
    const totalLessons = allCourses.reduce((sum, course) => sum + course.totalLessons, 0);
    const completedLessons = allCourses.reduce((sum, course) => sum + course.completedLessons.length, 0);
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getEnrolledStats = () => {
    return user.enrolledCourses.length;
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-content">
          <h1>Мой профиль</h1>
          <button onClick={handleLogout} className="btn-logout">
            Выход
          </button>
        </div>
      </header>

      <nav className="profile-nav">
        <button 
          onClick={() => navigate("/dashboard")}
          className="nav-btn"
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
          className="nav-btn active"
        >
          Профиль
        </button>
      </nav>

      <main className="profile-main">
        {/* Личная информация */}
        <section className="profile-section">
          <h2>Личная информация</h2>
          
          <div className="profile-card">
            {!isEditing ? (
              <div className="profile-info">
                <div className="info-field">
                  <label>Имя:</label>
                  <p>{user.fullName}</p>
                </div>
                <div className="info-field">
                  <label>Email:</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-field">
                  <label>Дата регистрации:</label>
                  <p>{new Date(user.createdAt).toLocaleDateString("ru-RU")}</p>
                </div>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  Редактировать
                </button>
              </div>
            ) : (
              <div className="profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Полное имя:</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email:</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    onClick={handleSave}
                    className="btn-save"
                  >
                    Сохранить
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="btn-cancel"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Статистика обучения */}
        <section className="profile-section">
          <h2>Статистика обучения</h2>
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>Общий прогресс</h3>
              <div className="stat-value">{getTotalProgress()}%</div>
              <div className="stat-bar">
                <div 
                  className="stat-fill" 
                  style={{ width: `${getTotalProgress()}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
              <h3>Активные курсы</h3>
              <div className="stat-value">{getEnrolledStats()}</div>
            </div>
          </div>
        </section>

        {/* Прогресс по курсам */}
        <section className="profile-section">
          <h2>Прогресс по курсам</h2>
          
          <div className="courses-progress">
            {Object.entries(user.coursesProgress).map(([courseId, progress]) => (
              <div key={courseId} className="course-progress-item">
                <div className="course-progress-header">
                  <h4>
                    {courseId === "welder" && "Курс: Сварщик"}
                    {courseId === "manager" && "Курс: Менеджер"}
                    {courseId === "seller" && "Курс: Продавец"}
                  </h4>
                  <span className="progress-percentage">
                    {Math.round((progress.completedLessons.length / progress.totalLessons) * 100)}%
                  </span>
                </div>
                
                <div className="course-progress-bar">
                  <div 
                    className="course-progress-fill"
                    style={{ 
                      width: `${Math.round((progress.completedLessons.length / progress.totalLessons) * 100)}%`
                    }}
                  ></div>
                </div>
                
                <p className="course-progress-text">
                  Пройдено уроков: {progress.completedLessons.length} из {progress.totalLessons}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;
