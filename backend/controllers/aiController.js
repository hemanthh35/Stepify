const { generateExplanation } = require('../config/openrouter');
const { run, get, all } = require('../models/database');

async function generate(req, res, next) {
  try {
    const { topic } = req.body || {};
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      const err = new Error('Topic is required');
      err.status = 400;
      throw err;
    }
    const trimmed = topic.trim().slice(0, 2000);

    const data = await generateExplanation(trimmed);
    const json = JSON.stringify(data);
    const title =
      typeof data.title === 'string' && data.title.trim() ? data.title.trim().slice(0, 500) : '';

    const insert = await run(
      'INSERT INTO history (user_id, input_prompt, response_json, title) VALUES (?, ?, ?, ?)',
      [req.user.id, trimmed, json, title],
    );

    res.json({
      success: true,
      data: {
        ...data,
        historyId: insert.lastID,
      },
    });
  } catch (e) {
    next(e);
  }
}

async function listHistory(req, res, next) {
  try {
    const rows = await all(
      `SELECT id, input_prompt, created_at, title
       FROM history
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC
       LIMIT 100`,
      [req.user.id],
    );
    res.json({
      history: rows.map((r) => ({
        id: r.id,
        input_prompt: r.input_prompt,
        created_at: r.created_at,
        title: r.title || '',
      })),
    });
  } catch (e) {
    next(e);
  }
}

async function getHistoryItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      const err = new Error('Invalid history id');
      err.status = 400;
      throw err;
    }

    const row = await get(
      'SELECT id, input_prompt, response_json, created_at FROM history WHERE id = ? AND user_id = ?',
      [id, req.user.id],
    );
    if (!row) {
      const err = new Error('History item not found');
      err.status = 404;
      throw err;
    }

    let parsed;
    try {
      parsed = JSON.parse(row.response_json);
    } catch {
      const err = new Error('Stored response is corrupted');
      err.status = 500;
      throw err;
    }

    res.json({
      id: row.id,
      input_prompt: row.input_prompt,
      created_at: row.created_at,
      data: parsed,
    });
  } catch (e) {
    next(e);
  }
}

async function deleteHistoryItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      const err = new Error('Invalid history id');
      err.status = 400;
      throw err;
    }

    const result = await run('DELETE FROM history WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!result.changes) {
      const err = new Error('History item not found');
      err.status = 404;
      throw err;
    }

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  generate,
  listHistory,
  getHistoryItem,
  deleteHistoryItem,
};
