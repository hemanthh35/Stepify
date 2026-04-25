const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../models/database');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeString(value, max = 255) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function formatUser(row) {
  return {
    id: row.id,
    email: row.email,
    created_at: row.created_at,
    display_name: row.display_name || '',
    headline: row.headline || '',
    bio: row.bio || '',
    location: row.location || '',
    website: row.website || '',
    avatar_url: row.avatar_url || '',
    github_url: row.github_url || '',
    linkedin_url: row.linkedin_url || '',
    twitter_url: row.twitter_url || '',
  };
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('Server misconfiguration');
    err.status = 500;
    throw err;
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn },
  );
}

async function signup(req, res, next) {
  try {
    const { email, password, confirmPassword } = req.body || {};

    if (!email || !password || !confirmPassword) {
      const err = new Error('Email, password, and confirm password are required');
      err.status = 400;
      throw err;
    }
    if (!isValidEmail(email)) {
      const err = new Error('Invalid email address');
      err.status = 400;
      throw err;
    }
    if (password.length < 8) {
      const err = new Error('Password must be at least 8 characters');
      err.status = 400;
      throw err;
    }
    if (password !== confirmPassword) {
      const err = new Error('Passwords do not match');
      err.status = 400;
      throw err;
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.status = 409;
      throw err;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await run('INSERT INTO users (email, password) VALUES (?, ?)', [
      email.toLowerCase(),
      hash,
    ]);

    const user = { id: result.lastID, email: email.toLowerCase() };
    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }

    const row = await get('SELECT id, email, password FROM users WHERE email = ?', [
      email.toLowerCase(),
    ]);
    if (!row) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, row.password);
    if (!ok) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const user = { id: row.id, email: row.email };
    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (e) {
    next(e);
  }
}

function logout(req, res) {
  res.json({ success: true });
}

async function profile(req, res, next) {
  try {
    const row = await get(
      `SELECT
        id, email, created_at,
        display_name, headline, bio, location, website, avatar_url,
        github_url, linkedin_url, twitter_url
       FROM users
       WHERE id = ?`,
      [req.user.id],
    );
    if (!row) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    res.json({ user: formatUser(row) });
  } catch (e) {
    next(e);
  }
}

async function updateProfile(req, res, next) {
  try {
    const payload = req.body || {};
    const displayName = normalizeString(payload.display_name, 80);
    const headline = normalizeString(payload.headline, 140);
    const bio = normalizeString(payload.bio, 600);
    const location = normalizeString(payload.location, 100);
    const website = normalizeString(payload.website, 255);
    const avatarUrl = normalizeString(payload.avatar_url, 200000);
    const githubUrl = normalizeString(payload.github_url, 255);
    const linkedinUrl = normalizeString(payload.linkedin_url, 255);
    const twitterUrl = normalizeString(payload.twitter_url, 255);

    await run(
      `UPDATE users SET
        display_name = ?,
        headline = ?,
        bio = ?,
        location = ?,
        website = ?,
        avatar_url = ?,
        github_url = ?,
        linkedin_url = ?,
        twitter_url = ?
      WHERE id = ?`,
      [
        displayName,
        headline,
        bio,
        location,
        website,
        avatarUrl,
        githubUrl,
        linkedinUrl,
        twitterUrl,
        req.user.id,
      ],
    );

    const updated = await get(
      `SELECT
        id, email, created_at,
        display_name, headline, bio, location, website, avatar_url,
        github_url, linkedin_url, twitter_url
       FROM users
       WHERE id = ?`,
      [req.user.id],
    );
    res.json({ success: true, user: formatUser(updated) });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  signup,
  login,
  logout,
  profile,
  updateProfile,
};
