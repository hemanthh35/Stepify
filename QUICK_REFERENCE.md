# 🔥 QUICK BUILD REFERENCE - OpenRouter + Gemma Setup

## 🎯 YOUR STACK

```
Frontend: React (Vite)
Backend: Node.js (Express)
Database: SQLite
AI: OpenRouter (Gemma-3N Free)
```

---

## ⚡ IMMEDIATE NEXT STEPS

### 1. Backend Setup (Do First)
```bash
mkdir learning-platform
cd learning-platform

# Backend folder
mkdir backend
cd backend
npm init -y

# Install dependencies
npm install express cors dotenv sqlite3 bcrypt jsonwebtoken axios

# Create .env (never commit real keys; copy from backend/.env.example)
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=google/gemma-3n-e4b-it:free
JWT_SECRET=your-super-secret-key-123
PORT=5000
```

### 2. Frontend Setup
```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer framer-motion axios

# Tailwind init
npx tailwindcss init -p
```

---

## 🔌 OPENROUTER API - EXACT USAGE

### Correct Format for Gemma-3N Free:

```javascript
const generateWithOpenRouter = async (topic) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5000', // IMPORTANT!
        'X-Title': 'Interactive Learning Platform', // IMPORTANT!
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemma-3n-e4b-it:free',
        messages: [
          {
            role: 'user',
            content: `Generate an interactive educational explanation for: "${topic}"

RETURN ONLY VALID JSON - NO MARKDOWN, NO EXTRA TEXT:

{
  "title": "Exact title",
  "description": "One line description",
  "steps": [
    {
      "id": 1,
      "heading": "Step 1",
      "description": "Clear explanation under 100 words",
      "interactionType": "text",
      "content": { "mainText": "The content goes here" }
    },
    {
      "id": 2,
      "heading": "Step 2", 
      "description": "Next part",
      "interactionType": "button_demo",
      "content": { "buttonLabel": "Try This", "result": "What happens" }
    }
  ]
}

Keep it educational, concise, and simple. Max 5 steps.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenRouter error:', data);
      throw new Error(data.error?.message || 'API error');
    }

    // Parse the response
    const content = data.choices[0].message.content;
    
    // Gemma sometimes wraps JSON in ```json``` - handle it
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## ⚠️ COMMON PITFALLS WITH GEMMA (FREE MODEL)

### ❌ Problem 1: Non-JSON Responses
Gemma sometimes adds markdown wrappers. Solution:
```javascript
// ALWAYS extract JSON with regex
const jsonMatch = content.match(/\{[\s\S]*\}/);
const parsed = JSON.parse(jsonMatch[0]);
```

### ❌ Problem 2: Missing HTTP-Referer Header
OpenRouter requires this. Always include:
```javascript
'HTTP-Referer': 'http://localhost:5000',
'X-Title': 'Your App Name'
```

### ❌ Problem 3: Slow Free Model
Gemma-3N free is slower. Add timeout:
```javascript
timeout: 60000 // 60 seconds
```

### ❌ Problem 4: JSON Parse Errors
Always wrap in try-catch:
```javascript
try {
  const parsed = JSON.parse(content);
} catch {
  // Return default structure
  return defaultExplanation;
}
```

---

## 🗄️ QUICK DATABASE SETUP

### SQLite Init (in backend):
```javascript
// database.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite');
});

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      input_prompt TEXT NOT NULL,
      response_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
```

---

## 🔐 AUTH PATTERN (Copy-Paste Ready)

### Backend Auth Middleware:
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### Frontend Auth Hook:
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/auth/login', {
        email,
        password
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, logout, loading };
};
```

---

## 🎨 TAILWIND CONFIG FOR LIGHT COLORS

### tailwind.config.js:
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F5F5F5',
        accent: '#7C3AED', // Purple
        light: '#FAFAFA',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### Global Styles (src/styles/globals.css):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  @apply transition-all duration-300;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-white text-gray-900 font-sans;
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-all;
  }

  .card {
    @apply bg-white border border-gray-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all;
  }

  .input {
    @apply w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100;
  }
}
```

---

## 🚀 TESTING WITH CURL (Before Frontend)

### Test Login:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Generate (with token):
```bash
curl -X POST http://localhost:5000/api/generate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"topic":"Binary Search"}'
```

---

## 📝 FRONTEND BASIC SETUP

### App.jsx Structure:
```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={auth.token ? <Dashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
```

---

## 🎯 BUILD ORDER (IMPORTANT!)

1. **Backend Setup** - Database + Auth endpoints
2. **Test Auth** - Signup/Login working with Postman
3. **Test OpenRouter** - API call successful, JSON parsed
4. **Frontend Auth** - Login/Signup pages working
5. **Frontend Dashboard** - Input box + API call
6. **Styling** - Add Tailwind + animations
7. **Polish** - History, errors, loading states

❌ **DON'T** build frontend first!
✅ **DO** build backend first and test with curl!

---

## 💡 IF STUCK

**OpenRouter not responding?**
- Check API key is correct
- Add HTTP-Referer header
- Check model name spelling
- Ensure Content-Type is application/json

**JSON parsing fails?**
- Log the full response: `console.log(data.choices[0].message.content)`
- Use regex to extract JSON: `content.match(/\{[\s\S]*\}/)`
- Add error fallback

**Auth not working?**
- Check JWT secret matches frontend + backend
- Verify token is being sent in Authorization header
- Check CORS is configured: `app.use(cors())`

**Slow responses?**
- Free Gemma model is ~5-10 seconds
- Add loading spinner during wait
- Consider caching results

---

**READY? Start with backend setup!** 🚀
