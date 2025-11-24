import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Добро пожаловать, {user.email}</h1>
      <p>Ваш прогресс по курсам:</p>

      {Object.entries(user.coursesProgress || {}).map(([course, progress]) => (
        <p key={course}>
          {course}: {progress}%
        </p>
      ))}
    </div>
  );
}
