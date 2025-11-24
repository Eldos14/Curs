import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const saveUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // Опциональная синхронизация с бэкендом, если указан адрес
    try {
      const BACKEND_URL = import.meta?.env?.VITE_BACKEND_URL || window?.__BACKEND_URL__;
      if (BACKEND_URL) {
        // POST/PUT to /api/users — best-effort, не блокируем UI
        fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        }).catch((err) => {
          console.warn('Не удалось синхронизировать профиль с бэкендом', err);
        });
      }
    } catch (e) {
      // import.meta may be undefined in some environments — тихо игнорируем
    }
  };

  const login = async (email, password, fullName = "") => {
    let userData = {
      email,
      fullName: fullName || email.split("@")[0],
      coursesProgress: {
        welder: { completedLessons: [], totalLessons: 3, started: false, tests: {} },
        manager: { completedLessons: [], totalLessons: 2, started: false, tests: {} },
        seller: { completedLessons: [], totalLessons: 3, started: false, tests: {} },
      },
      enrolledCourses: [],
      createdAt: new Date().toISOString(),
    };

    // Попробовать загрузить профиль с бэкенда
    try {
      const BACKEND_URL = import.meta?.env?.VITE_BACKEND_URL || window?.__BACKEND_URL__;
      if (BACKEND_URL) {
        const resp = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/users/${encodeURIComponent(email)}`);
        if (resp.ok) {
          const serverUser = await resp.json();
          // Слияние: если на сервере есть профиль, используем его, иначе — локальный
          userData = { ...userData, ...serverUser };
        }
      }
    } catch (e) {
      // Если сервер недоступен — используем локальный профиль
    }
    saveUser(userData);
  };

  const register = (email, password, fullName) => {
    const userData = {
      email,
      fullName,
      coursesProgress: {
        welder: { completedLessons: [], totalLessons: 3, started: false, tests: {} },
        manager: { completedLessons: [], totalLessons: 2, started: false, tests: {} },
        seller: { completedLessons: [], totalLessons: 3, started: false, tests: {} },
      },
      enrolledCourses: [],
      createdAt: new Date().toISOString(),
    };
    saveUser(userData);
  };

  const saveTestResult = useCallback((courseId, lessonId, result) => {
    if (!user) return;
    const progress = user.coursesProgress[courseId] || { completedLessons: [], totalLessons: 0, started: false, tests: {} };
    const updatedTests = { ...(progress.tests || {}), [lessonId]: result };

    const updatedUser = {
      ...user,
      coursesProgress: {
        ...user.coursesProgress,
        [courseId]: {
          ...progress,
          tests: updatedTests,
        },
      },
    };

    saveUser(updatedUser);
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = useCallback((updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    saveUser(updatedUser);
  }, [user]);

  const enrollCourse = useCallback((courseId) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      enrolledCourses: [...new Set([...user.enrolledCourses, courseId])],
      coursesProgress: {
        ...user.coursesProgress,
        [courseId]: {
          ...user.coursesProgress[courseId],
          started: true,
        },
      },
    };
    saveUser(updatedUser);
  }, [user]);

  const markLessonComplete = useCallback((courseId, lessonId) => {
    if (!user) return;
    const progress = user.coursesProgress[courseId];
    const newCompletedLessons = [...new Set([...progress.completedLessons, lessonId])];
    
    const updatedUser = {
      ...user,
      coursesProgress: {
        ...user.coursesProgress,
        [courseId]: {
          ...progress,
          completedLessons: newCompletedLessons,
        },
      },
    };
    saveUser(updatedUser);
  }, [user]);

  const getCourseProgress = useCallback((courseId) => {
    if (!user || !user.coursesProgress[courseId]) return null;
    const progress = user.coursesProgress[courseId];
    const percentage = Math.round(
      (progress.completedLessons.length / progress.totalLessons) * 100
    );
    return {
      ...progress,
      percentage,
      isCompleted: percentage === 100,
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        enrollCourse,
        markLessonComplete,
        getCourseProgress,
        saveTestResult,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
