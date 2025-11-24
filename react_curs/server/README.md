# Simple backend for React Curs

This is a minimal Express server that stores user profiles in `db.json`.

API:
- `GET /api/users/:email` - get user by email
- `POST /api/users` - save or update user (body: whole user object with `email`)

Run:

```powershell
cd server; npm install; npm start
```

Notes:
- This is intended for local development only. It uses a simple file `db.json` to store data.
- For production use a real database and authentication.
