# Little Lemon - Booking back-end

Project: `littlelemon` | App: `restaurant` | DB: MySQL | Env: pipenv

## 1. Create the MySQL database
```sql
CREATE DATABASE reservations;
```

## 2. Database credentials
Defaults live in `littlelemon/settings.py` (user `root`, empty password, host `127.0.0.1`, db `reservations`).
Override without editing code via environment variables:
```bash
export DB_NAME=reservations DB_USER=myuser DB_PASSWORD=mypassword DB_HOST=127.0.0.1 DB_PORT=3306
```

## 3. Run
```bash
cd littlelemon
pipenv shell
pipenv install
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
Open http://127.0.0.1:8000/book/ and http://127.0.0.1:8000/reservations/

## If `mysqlclient` fails to install
- macOS: `brew install mysql pkg-config`
- Debian/Ubuntu: `sudo apt install libmysqlclient-dev pkg-config build-essential`

## Endpoints
| URL | Purpose |
|-----|---------|
| `/book/` | Booking form + bookings for the selected date |
| `/reservations/` | All bookings as JSON |
| `/bookings?date=YYYY-MM-DD` | GET: bookings for a date (JSON). POST: create booking |
# Little-Lemon
