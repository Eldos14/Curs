// VIDEO_INTEGRATION.md - Интеграция видео в приложение

# 📹 Интеграция видео в приложение

## Способы добавления видео

### Способ 1: Локальные видео файлы (РЕКОМЕНДУЕТСЯ для разработки)

1. **Создайте папку для видео:**
   ```
   public/
   └── videos/
       ├── welder1.mp4
       ├── welder2.mp4
       ├── welder3.mp4
       ├── manager1.mp4
       ├── manager2.mp4
       ├── seller1.mp4
       ├── seller2.mp4
       └── seller3.mp4
   ```

2. **Используйте пути в `src/data/courses.js`:**
   ```javascript
   {
     id: 1,
     title: "Введение",
     video: "/videos/welder1.mp4"
   }
   ```

### Способ 2: Видео с публичных сервисов

#### YouTube
```javascript
{
  id: 1,
  title: "Введение",
  video: "https://www.youtube.com/embed/VIDEO_ID"
}
```

Обновите компонент `CoursePage.jsx`:
```jsx
{videoSource.includes('youtube.com') ? (
  <iframe
    width="100%"
    height="600"
    src={currentLesson.video}
    frameBorder="0"
    allowFullScreen
  ></iframe>
) : (
  <video controls>
    <source src={currentLesson.video} type="video/mp4" />
  </video>
)}
```

#### Vimeo
```javascript
{
  id: 1,
  title: "Введение",
  video: "https://player.vimeo.com/video/VIDEO_ID"
}
```

### Способ 3: Облачное хранилище (AWS S3, Google Cloud, etc.)

```javascript
{
  id: 1,
  title: "Введение",
  video: "https://my-bucket.s3.amazonaws.com/welder1.mp4"
}
```

## Рекомендуемые форматы видео

- **Контейнер:** MP4
- **Видео кодек:** H.264
- **Аудио кодек:** AAC
- **Разрешение:** 1280x720 (HD) или 1920x1080 (Full HD)
- **Битрейт видео:** 2000-5000 kbps
- **Битрейт аудио:** 128 kbps
- **Максимальный размер файла:** 100-500 MB

## Сжатие видео (рекомендуется)

### Использование FFmpeg

```bash
# Базовое сжатие
ffmpeg -i input.mp4 -vf "scale=1280:720" -b:v 2000k -b:a 128k output.mp4

# Высокое качество
ffmpeg -i input.mp4 -vf "scale=1920:1080" -b:v 5000k -b:a 128k output.mp4

# Низкое качество (для мобильных)
ffmpeg -i input.mp4 -vf "scale=854:480" -b:v 500k -b:a 64k output.mp4
```

### Использование онлайн-сервисов

- **CloudConvert** (cloudconvert.com)
- **Handbrake** (локальная программа)
- **MediaCoder** (локальная программа)

## Структура видео данных в courses.js

### Текущая структура
```javascript
export const courses = [
  {
    id: "welder",
    title: "Курс: Сварщик",
    lessons: [
      { 
        id: 1, 
        title: "Введение", 
        video: "/videos/welder1.mp4" 
      },
      // ...
    ]
  },
  // ...
];
```

### Расширенная структура (опционально)
```javascript
export const courses = [
  {
    id: "welder",
    title: "Курс: Сварщик",
    description: "Полное руководство для начинающих сварщиков",
    duration: "2 часа 30 минут",
    lessons: [
      { 
        id: 1, 
        title: "Введение",
        description: "Краткое введение в курс",
        video: "/videos/welder1.mp4",
        duration: "10 минут",
        materials: "intro.pdf"
      },
      // ...
    ]
  },
  // ...
];
```

## Добавление новых видео

1. **Отредактируйте файл `src/data/courses.js`:**

```javascript
{
  id: "newCourse",
  title: "Курс: Новая профессия",
  lessons: [
    { 
      id: 1, 
      title: "Урок 1", 
      video: "/videos/newcourse1.mp4" 
    },
    { 
      id: 2, 
      title: "Урок 2", 
      video: "/videos/newcourse2.mp4" 
    },
  ]
}
```

2. **Обновите контекст авторизации (`src/context/AuthContext.jsx`):**

```javascript
const userData = {
  // ...
  coursesProgress: {
    welder: { /* ... */ },
    manager: { /* ... */ },
    seller: { /* ... */ },
    newCourse: { 
      completedLessons: [], 
      totalLessons: 2, 
      started: false 
    }
  }
};
```

## Оптимизация производительности видео

### 1. Ленивая загрузка видео
```jsx
<video 
  controls
  loading="lazy"
  preload="metadata"
>
  <source src={currentLesson.video} type="video/mp4" />
</video>
```

### 2. Предварительная загрузка
```jsx
const handleLessonChange = () => {
  // Предварительная загрузка следующего видео
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = nextLesson.video;
  document.head.appendChild(link);
};
```

### 3. Использование различных качеств видео

```jsx
<video controls>
  <source src={video.hd} type="video/mp4" />
  <source src={video.sd} type="video/mp4" />
</video>
```

## Отслеживание просмотра видео

### Отслеживание времени просмотра
```jsx
const handleTimeUpdate = (e) => {
  const watchedPercentage = (e.target.currentTime / e.target.duration) * 100;
  console.log(`Просмотрено: ${watchedPercentage.toFixed(2)}%`);
};

<video onTimeUpdate={handleTimeUpdate} controls>
  <source src={currentLesson.video} type="video/mp4" />
</video>
```

### Автоматическое отмечание как просмотренное
```jsx
const handleVideoEnded = () => {
  markLessonComplete(courseId, lessonId);
  console.log('Видео завершено!');
};

<video onEnded={handleVideoEnded} controls>
  <source src={currentLesson.video} type="video/mp4" />
</video>
```

## Обработка ошибок при загрузке видео

```jsx
const handleVideoError = (e) => {
  console.error('Ошибка при загрузке видео:', e);
  alert('К сожалению, видео не удалось загрузить. Пожалуйста, проверьте подключение к интернету.');
};

<video 
  controls 
  onError={handleVideoError}
>
  <source src={currentLesson.video} type="video/mp4" />
  Ваш браузер не поддерживает воспроизведение видео.
</video>
```

## Поддерживаемые браузеры

| Браузер | Поддержка MP4 |
|---------|---------------|
| Chrome | ✓ |
| Firefox | ✓ |
| Safari | ✓ |
| Edge | ✓ |
| Internet Explorer | ✓ (с ограничениями) |

## Полезные ссылки

- [MDN - HTML Video Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Video Hosting Services](https://www.cloudflare.com/learning/video/how-to-host-video-online/)

## Примеры добавления видео

### Пример 1: Локальные видео
```javascript
export const courses = [
  {
    id: "welder",
    title: "Курс: Сварщик",
    lessons: [
      { id: 1, title: "Введение", video: "/videos/welder1.mp4" },
      { id: 2, title: "Техника", video: "/videos/welder2.mp4" },
      { id: 3, title: "Практика", video: "/videos/welder3.mp4" },
    ]
  }
];
```

### Пример 2: Видео с облака
```javascript
export const courses = [
  {
    id: "manager",
    title: "Курс: Менеджер",
    lessons: [
      { 
        id: 1, 
        title: "Основы", 
        video: "https://cloud.example.com/videos/manager1.mp4" 
      },
      { 
        id: 2, 
        title: "Лидерство", 
        video: "https://cloud.example.com/videos/manager2.mp4" 
      },
    ]
  }
];
```

## Заключение

Теперь вы знаете, как интегрировать видео в приложение! Выберите удобный для вас способ и начните загружать видеоуроки.
