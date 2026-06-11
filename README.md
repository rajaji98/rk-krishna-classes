# RK Krishna Classes Website

This is a complete teacher-only student management website for RK Krishna Classes.

It includes:

- Teacher login
- Student add, edit, delete
- Subject records
- Fee amount, paid amount, and balance due
- Payment status filters
- Search
- CSV export
- Simple backend API
- Local JSON storage in `server/data`

## 1. Install Required Software

Install these first:

1. VS Code: https://code.visualstudio.com/
2. Node.js LTS: https://nodejs.org/

After installing Node.js, open Command Prompt or PowerShell and check:

```powershell
node -v
npm -v
```

Both commands should show version numbers.

## 2. Folder Structure

Open this folder in VS Code:

```text
C:\Users\asus\Documents\Codex\2026-05-27\i-want-to-build-a-website
```

The project folders are:

```text
rk-krishna-classes/
  package.json
  .env.example
  .gitignore
  README.md
  public/
    index.html
    styles.css
    app.js
    assets/
      classroom-banner.png
  server/
    app.js
    data/
      students.json
      teachers.json
    middleware/
      auth.js
    routes/
      auth.js
      students.js
    scripts/
      resetTeacher.js
    utils/
      bootstrap.js
      store.js
```

## 3. What Each File Does

`package.json` lists the backend packages and run commands.

`public/index.html` is the main page seen in the browser.

`public/styles.css` controls the design.

`public/app.js` runs the frontend logic: login, forms, table, filters, and export.

`public/assets/classroom-banner.png` is the login page image.

`server/app.js` starts the Express backend and serves the frontend.

`server/routes/auth.js` handles teacher login, logout, and session checking.

`server/routes/students.js` handles student create, read, update, and delete APIs.

`server/middleware/auth.js` protects private API routes.

`server/utils/store.js` reads and writes JSON files.

`server/utils/bootstrap.js` creates the first teacher account if needed.

`server/scripts/resetTeacher.js` resets the teacher username and password.

`server/data/students.json` stores student data.

`server/data/teachers.json` stores teacher login data with hashed password.

## 4. Open Project in VS Code

1. Open VS Code.
2. Click `File` > `Open Folder`.
3. Select:

```text
C:\Users\asus\Documents\Codex\2026-05-27\i-want-to-build-a-website
```

4. Open the VS Code terminal:

```text
Terminal > New Terminal
```

## 5. Install Packages

In the VS Code terminal, run:

```powershell
npm install
```

This creates the `node_modules` folder.

## 6. Create Your Environment File

In VS Code, create a file named:

```text
.env
```

Copy this into it:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=my-rk-krishna-classes-secret-key-change-this
DEFAULT_TEACHER_USERNAME=teacher
DEFAULT_TEACHER_PASSWORD=ChangeMe@123
```

For public hosting, use a stronger password and a longer `JWT_SECRET`.

## 7. Run the Website

In the VS Code terminal, run:

```powershell
npm run dev
```

Open your browser:

```text
http://localhost:3000
```

Default login:

```text
Username: teacher
Password: ChangeMe@123
```

## 8. Add Student Data

After login, use the form on the right side:

- Student name
- Subject
- Phone
- Email
- Joining date
- Total fee
- Amount paid
- Payment status
- Due date
- Notes

Click `Save Student`.

The records are saved in:

```text
server/data/students.json
```

## 9. Change Teacher Password

Edit your `.env` file:

```env
DEFAULT_TEACHER_USERNAME=teacher
DEFAULT_TEACHER_PASSWORD=YourNewStrongPassword
```

Then run:

```powershell
npm run reset-teacher
```

Restart the website:

```powershell
npm run dev
```

## 10. Public Hosting Options

For a teacher-only app with private student and payment data, do not host it as only static HTML. It needs the backend too.

Beginner-friendly options:

1. Render: https://render.com/
2. Railway: https://railway.com/
3. VPS hosting such as Hostinger VPS, DigitalOcean, or AWS Lightsail

Render/Railway are simpler for beginners.

## 11. Deploy on Render

1. Create a GitHub account.
2. Create a new GitHub repository.
3. Upload this full project to GitHub.
4. Create a Render account.
5. Click `New` > `Web Service`.
6. Connect your GitHub repository.
7. Use these settings:

```text
Build Command: npm install
Start Command: npm start
```

8. Add environment variables in Render:

```env
NODE_ENV=production
JWT_SECRET=use-a-long-random-secret
DEFAULT_TEACHER_USERNAME=teacher
DEFAULT_TEACHER_PASSWORD=your-strong-password
```

9. Deploy.

Important: free hosting may restart and may not keep JSON files permanently. For real long-term student/payment records, connect a real database such as PostgreSQL or MongoDB before using it seriously.

## 12. Backend API

Teacher auth:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Students:

```text
GET    /api/students
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
```

## 13. Security Notes

- Keep `.env` private.
- Do not share your teacher password.
- Use a strong `JWT_SECRET`.
- Use HTTPS when hosted publicly.
- Do not upload private student data to a public GitHub repository.
- Move to a real hosted database before using the website for important records.