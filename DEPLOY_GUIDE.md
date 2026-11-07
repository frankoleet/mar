# 🚀 Деплой на GitHub и Vercel

## Шаг 1: Загрузка на GitHub

### Вариант A: Через GitHub Desktop (проще)

1. **Скачайте GitHub Desktop**
   - https://desktop.github.com/
   - Установите и войдите в аккаунт

2. **Создайте репозиторий**
   - File → Add Local Repository
   - Выберите папку `c:\Users\31vv3\Desktop\marvel`
   - Нажмите "Create Repository"

3. **Сделайте первый коммит**
   - Введите описание: "Initial commit: Marvel website for Misha"
   - Нажмите "Commit to main"

4. **Опубликуйте на GitHub**
   - Нажмите "Publish repository"
   - Имя: `marvel-misha` (или любое другое)
   - ✓ Снимите галочку "Keep this code private" (если хотите публичный)
   - Нажмите "Publish repository"

✅ **Готово!** Репозиторий на GitHub создан.

---

### Вариант B: Через командную строку (для опытных)

Откройте PowerShell в папке `c:\Users\31vv3\Desktop\marvel` и выполните:

```bash
# 1. Инициализируем Git
git init

# 2. Добавляем все файлы
git add .

# 3. Делаем первый коммит
git commit -m "Initial commit: Marvel website for Misha"

# 4. Создайте новый репозиторий на github.com
# Затем подключите его:
git remote add origin https://github.com/ВАШ_USERNAME/marvel-misha.git

# 5. Отправляем на GitHub
git branch -M main
git push -u origin main
```

---

### Вариант C: Через веб-интерфейс GitHub

1. **Создайте репозиторий на GitHub**
   - Откройте: https://github.com/new
   - Repository name: `marvel-misha`
   - Public или Private
   - НЕ добавляйте README, .gitignore, license
   - Нажмите "Create repository"

2. **Загрузите файлы**
   - На странице репозитория нажмите "uploading an existing file"
   - Перетащите ВСЕ файлы из папки `marvel`
   - Commit message: "Initial commit"
   - Нажмите "Commit changes"

✅ **Готово!** Репозиторий создан.

---

## Шаг 2: Деплой на Vercel

### Способ 1: Через веб-интерфейс (рекомендуется)

1. **Откройте Vercel**
   - Зайдите на: https://vercel.com/
   - Нажмите "Sign Up" (если нет аккаунта)
   - Войдите через GitHub аккаунт

2. **Импортируйте проект**
   - Нажмите "Add New..." → "Project"
   - Найдите репозиторий `marvel-misha`
   - Нажмите "Import"

3. **Настройте проект**
   - Project Name: `marvel-misha` (или любое)
   - Framework Preset: `Other` (оставьте как есть)
   - Root Directory: `./` (корень)
   - Build Command: оставьте пустым
   - Output Directory: оставьте пустым
   - Install Command: оставьте пустым

4. **Задеплойте**
   - Нажмите "Deploy"
   - Ждите 1-2 минуты

5. **Получите ссылку**
   - После деплоя увидите: `https://marvel-misha.vercel.app`
   - Откройте и проверьте!

✅ **Готово!** Сайт в интернете.

---

### Способ 2: Через Vercel CLI

Установите Vercel CLI и задеплойте:

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Перейдите в папку проекта
cd c:\Users\31vv3\Desktop\marvel

# 3. Войдите в аккаунт
vercel login

# 4. Задеплойте
vercel

# Следуйте инструкциям:
# - Set up and deploy? Y
# - Which scope? (выберите свой аккаунт)
# - Link to existing project? N
# - Project name: marvel-misha
# - Directory: ./ (Enter)
# - Override settings? N

# 5. Для продакшн-деплоя
vercel --prod
```

✅ **Готово!** Получите ссылку.

---

## Шаг 3: Обновление сайта (в будущем)

### Если меняете код:

1. **Сохраните изменения в Git:**
   ```bash
   git add .
   git commit -m "Update photos and scenes"
   git push
   ```

2. **Vercel автоматически** задеплоит изменения!
   - Каждый push → новый деплой
   - Проверяйте на `https://vercel.com/dashboard`

---

## 🔗 Полезные ссылки

- **GitHub:** https://github.com/
- **GitHub Desktop:** https://desktop.github.com/
- **Vercel:** https://vercel.com/
- **Vercel Docs:** https://vercel.com/docs

---

## ⚙️ Дополнительные настройки Vercel

### Кастомный домен (опционально)

1. Зайдите в проект на Vercel
2. Settings → Domains
3. Добавьте свой домен (если есть)

### Environment Variables (если нужны)

1. Settings → Environment Variables
2. Добавьте переменные окружения

### Настройки деплоя

Создайте файл `vercel.json` в корне проекта:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

Но для вашего проекта это **НЕ ОБЯЗАТЕЛЬНО** — всё работает из коробки!

---

## 🎯 Чек-лист деплоя

### GitHub:
- [ ] Репозиторий создан
- [ ] Все файлы загружены
- [ ] Видны в веб-интерфейсе github.com

### Vercel:
- [ ] Проект импортирован
- [ ] Деплой успешен (зелёный статус)
- [ ] Сайт открывается по ссылке
- [ ] Все фото загружаются
- [ ] Эффекты работают
- [ ] На телефоне всё корректно

---

## 🐛 Troubleshooting

**Фото не загружаются на Vercel:**
- Проверьте, что папка `photos/` загружена в GitHub
- Проверьте пути в `scenes.json` (должны быть `photos/01.jpg`)

**Звуки не работают:**
- Убедитесь, что файлы MP3 добавлены в GitHub
- Проверьте размер файлов (до 5 MB каждый)
- Vercel может не поддерживать очень большие файлы

**Сайт показывает 404:**
- Убедитесь, что `index.html` в корне проекта
- Проверьте, что Root Directory в Vercel = `./`

**CSS/JS не применяется:**
- Проверьте пути в `index.html`
- Должны быть относительные: `css/style.css`, `js/app.js`

---

## 📱 Тестирование

После деплоя проверьте:
- ✅ Открывается на десктопе
- ✅ Открывается на телефоне
- ✅ Все фото видны
- ✅ Эффекты работают
- ✅ Навигация работает (свайпы, клики)
- ✅ Звук работает (если добавили)
- ✅ Кнопка "Поделиться" работает

---

**Готово!** 🎉 Теперь ваш сайт в интернете!

Делитесь ссылкой: `https://marvel-misha.vercel.app`
