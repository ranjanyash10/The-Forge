# The Forge ⚔️

**The Forge** is an RPG-inspired, real-life character progression dashboard that gamifies personal development, fitness, and coding discipline. Convert your goals, weights, and daily struggles into real-time XP, level up attributes, unlock dynamic chronicles, and forge your ultimate developer alter ego.

---

## 📁 Repository Structure

This is a monorepo containing both the web backend and the cross-platform mobile client:

- **`backend-web/`**: Next.js 16 (App Router + Turbopack) application, REST API endpoints, Prisma database mapping, and OpenAI-powered narrative generator.
- **`frontend-mobile/`**: Flutter cross-platform mobile application featuring interactive progress trackers, cyber/RPG aesthetic styling, and state synchronization.

---

## ⚡ Quick Start (Local Development)

### 1. Run the Web Backend & Web UI
Navigate to the `backend-web` folder:

```bash
cd backend-web
```

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure your environment**:
   Create a `.env` file in the `backend-web` folder:
   ```env
   # Required for AI character generation
   OPENAI_API_KEY=your_openai_key_here
   
   # Optional: Defaults to SQLite dev.db local file if omitted
   # DATABASE_URL=postgresql://user:password@host:5432/db
   ```
3. **Run database migrations**:
   ```bash
   npx prisma db push
   ```
4. **Seed base data** (ranks, titles):
   ```bash
   npx prisma db seed
   ```
5. **Start dev server**:
   ```bash
   npm run dev -- -p 3000
   ```
   The backend will be live at `http://localhost:3000`.

---

### 2. Run the Flutter Mobile App
Navigate to the `frontend-mobile` folder:

```bash
cd ../frontend-mobile
```

1. **Fetch Flutter packages**:
   ```bash
   flutter pub get
   ```
2. **Launch development target**:
   - For Web target on port `8081`:
     ```bash
     flutter run -d web-server --web-port 8081
     ```
   - For Android Emulator / iOS Simulator:
     ```bash
     flutter run
     ```
   The mobile client automatically routes API requests to `http://localhost:3000/api` (Web/iOS) or `http://10.0.2.2:3000/api` (Android Emulator).

---

## 🛡️ Production & Deployment Configuration

### 1. Database Provisioning (PostgreSQL & SQLite)
The backend features an automatic database switcher script (`scripts/prepare-db.js`). 
- If `DATABASE_URL` is configured for **PostgreSQL** in production, the build runner automatically alters `schema.prisma` to use the `postgresql` provider and generates the client.
- If no URL is provided, it falls back to **SQLite** (`dev.db`).

Deploy command for database updates:
```bash
npm run db:migrate:prod
```

### 2. Running via Docker
Build and deploy containerized builds using the custom multi-stage configurations:
```bash
# In backend-web/
docker-compose up --build
```

### 3. Compiling the Flutter Production App
Build release binaries by defining the production API domain compiled compile-time:

- **Android (APK)**:
  ```bash
  flutter build apk --release --dart-define=API_URL=https://<your-domain>/api
  ```
- **Web App**:
  ```bash
  flutter build web --release --dart-define=API_URL=https://<your-domain>/api
  ```
- **iOS (IPA Bundle)**:
  ```bash
  flutter build ipa --release --dart-define=API_URL=https://<your-domain>/api
  ```
