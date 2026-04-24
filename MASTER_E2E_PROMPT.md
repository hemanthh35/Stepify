# 🚀 MASTER E2E PROMPT - Interactive AI Learning Platform
## Using OpenRouter + Gemma-3N Free Model

---

## 📋 PROJECT OVERVIEW

You are building a **full-stack AI-powered interactive learning platform** where:
- Users input topics/questions
- AI generates step-by-step interactive explanations
- Each step has UI, animations, and interactive elements
- Users can save and revisit learning histories

**Tech Stack:**
- Frontend: React + Vite
- Backend: Node.js (Express)
- Database: SQLite
- AI API: OpenRouter (google/gemma-3n-e4b-it:free)
- Styling: Tailwind CSS
- Animations: Framer Motion

---

## 🎨 DESIGN REQUIREMENTS

**Color Palette:**
- Primary: Soft whites (#FAFAFA, #F5F5F5)
- Accent: Pastel blues, purples, greens
- Text: Dark gray (#2D3436)
- Borders: Light gray (#E0E0E0)

**Typography:**
- Headlines: Geist Sans / Inter Bold (clean, modern)
- Body: Inter / Poppins (light weight 300-400)
- Sizes: Readable, 16px base, good line-height

**UI Style:**
- Minimalist card-based layout
- Smooth transitions (150-300ms)
- Subtle shadows and hover effects
- Responsive mobile-first design

---

## 🔐 AUTHENTICATION SYSTEM

### Pages Required:
1. **Landing Page** - Hero section + features
2. **Signup Page** - Email, password, confirm password
3. **Login Page** - Email, password, remember me
4. **Dashboard** - Main app interface

### Features:
- User registration with validation
- Login with JWT tokens (or session-based)
- Password hashing (bcrypt)
- Protected routes (redirect to login if not authenticated)
- Logout functionality
- Persistent auth (localStorage/session)

### Database Schema:
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  input_prompt TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🧠 CORE AI FEATURE - INTERACTIVE EXPLANATION GENERATOR

### Input:
User enters a topic or question (e.g., "Explain binary search" or "How does photosynthesis work?")

### Output Format (STRICT JSON):
```json
{
  "title": "Clear, concise title",
  "description": "Brief 1-2 line description",
  "steps": [
    {
      "id": 1,
      "heading": "Step title",
      "description": "Explanation text (max 100 words)",
      "interactionType": "text | button_demo | slider | animation | comparison",
      "content": {
        "mainText": "Explanation",
        "buttonLabel": "Optional",
        "sliderMin": 0,
        "sliderMax": 100,
        "animationDescription": "What happens"
      }
    }
  ]
}
```

### AI Prompt Constraints:
- Always return valid JSON (no markdown, no explanations outside JSON)
- Max 5 steps per explanation
- Each step under 100 words
- Use simple, clear language
- Include at least one interactive element

---

## ⚙️ BACKEND (Node.js + Express)

### Folder Structure:
```
backend/
├── server.js
├── routes/
│   ├── auth.js
│   └── api.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── controllers/
│   ├── authController.js
│   └── aiController.js
├── models/
│   └── database.js
├── config/
│   └── openrouter.js
└── .env
```

### Key Endpoints:
```
POST /auth/signup
- Body: { email, password, confirmPassword }
- Returns: { success, token, user }

POST /auth/login
- Body: { email, password }
- Returns: { success, token, user }

POST /auth/logout
- Returns: { success }

GET /auth/profile
- Headers: { Authorization: Bearer {token} }
- Returns: { user }

POST /api/generate
- Headers: { Authorization: Bearer {token} }
- Body: { topic }
- Returns: { success, data: { title, steps } }

GET /api/history
- Headers: { Authorization: Bearer {token} }
- Returns: { history: [...] }

GET /api/history/:id
- Headers: { Authorization: Bearer {token} }
- Returns: { data }
```

### Environment Variables:
```
PORT=5000
DATABASE_URL=./database.sqlite
JWT_SECRET=your-secret-key-here
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=google/gemma-3n-e4b-it:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### OpenRouter Integration Pattern:
```javascript
const generateExplanation = async (topic) => {
  const prompt = `You are an expert educational AI. Generate an interactive step-by-step explanation for: "${topic}"

Return ONLY valid JSON (no markdown, no extra text):
{
  "title": "Clear title",
  "description": "Brief description",
  "steps": [
    {
      "id": 1,
      "heading": "Step heading",
      "description": "Explanation (max 100 words)",
      "interactionType": "text",
      "content": { "mainText": "Content" }
    }
  ]
}

Keep it educational, interactive, and simple. Max 5 steps.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Interactive Learning Platform',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3n-e4b-it:free',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};
```

---

## ⚛️ FRONTEND (React + Vite)

### Folder Structure:
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── AuthForm.jsx
│   │   ├── Dashboard.jsx
│   │   ├── StepCard.jsx
│   │   ├── InteractiveRenderer.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Dashboard.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useApi.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
└── .env
```

### Key Features:

**Landing Page:**
- Hero section with CTA button
- Feature cards
- Smooth scroll animations
- Call-to-action (Sign Up / Login)

**Authentication Pages:**
- Clean form design
- Real-time validation
- Error messages
- Loading states
- Link between signup/login

**Dashboard:**
- Input box (topic/question)
- Generate button with loading state
- Step-by-step display
- Each step rendered as interactive card
- Smooth transitions between steps
- History sidebar (optional)

**Components:**
- Navbar with logout
- StepCard (renders step with interaction)
- InteractiveRenderer (handles button clicks, sliders, animations)
- LoadingSpinner (during AI generation)
- ErrorBoundary (catch errors gracefully)

### Styling Notes:
- Use Tailwind only (no custom CSS unless needed)
- Light colors: bg-white, bg-gray-50, bg-blue-50
- Soft shadows: shadow-sm, shadow-md
- Smooth transitions: transition-all duration-300
- Hover effects on buttons/cards

### Key Hooks:
```javascript
useAuth() - manages login state, tokens, user info
useApi() - handles API calls with loading/error states
```

---

## 🔌 INTEGRATION CHECKLIST

### Backend Setup:
- [ ] Express server running on port 5000
- [ ] SQLite database initialized
- [ ] JWT auth implemented
- [ ] OpenRouter API connected
- [ ] All routes tested with Postman/Curl

### Frontend Setup:
- [ ] React + Vite project initialized
- [ ] Tailwind CSS configured
- [ ] Auth context working
- [ ] API hooks implemented
- [ ] Routes protected (login required for dashboard)

### Connection:
- [ ] Frontend points to correct backend URL
- [ ] CORS configured properly
- [ ] Tokens stored and sent correctly
- [ ] API responses parsed correctly

---

## 🚀 DEPLOYMENT READY CHECKLIST

- [ ] Environment variables not hardcoded
- [ ] Error handling on all endpoints
- [ ] Form validation (frontend + backend)
- [ ] Loading states during API calls
- [ ] Responsive design tested
- [ ] Passwords hashed with bcrypt
- [ ] Protected routes functional
- [ ] Database queries optimized

---

## ⚡ MVP PRIORITY (Start with this)

**Phase 1 - Core Auth:**
1. Signup/Login pages
2. JWT authentication
3. Protected dashboard route

**Phase 2 - AI Integration:**
1. Input box + button
2. Call OpenRouter API
3. Display steps as cards

**Phase 3 - Polish:**
1. Add animations
2. Better styling
3. History/save feature

---

## 🎯 SUCCESS CRITERIA

✅ User can sign up/login
✅ Dashboard loads after login
✅ Input topic → AI generates explanation
✅ Steps display as interactive cards
✅ Smooth animations and transitions
✅ Clean, modern UI with light colors
✅ Responsive on mobile + desktop
✅ No console errors

---

## 📝 NOTES FOR AI GENERATION

When building this with Claude or OpenAI:

1. **Ask for folder structure first**
2. **Then ask for backend code** (auth + AI integration)
3. **Then ask for frontend code** (components, pages)
4. **Then ask for integration guide**

✅ This prevents broken code and ensures things work.

🔥 **DON'T ask for full app in one response** — it breaks.

---

## 🔑 FINAL CHECKLIST BEFORE BUILDING

- [ ] OpenRouter API key ready
- [ ] Model: google/gemma-3n-e4b-it:free
- [ ] Node.js + npm installed
- [ ] SQLite available
- [ ] React + Vite understanding
- [ ] Tailwind CSS basics known
- [ ] JWT auth concepts clear

---

**READY TO BUILD?** Start with backend folder structure! 🚀
