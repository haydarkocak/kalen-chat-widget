// conversation/logger.js
import { queryDB } from '../db/connection.js';

export async function logMessage(env, sessionId, role, content, metadata = {}) {
  try {
    await queryDB(env, `
      INSERT INTO messages (
        session_id, role, content, 
        ai_model, tokens_used, cost, response_time_ms,
        conversation_phase
      ) VALUES (
        (SELECT id FROM sessions WHERE session_id = $1),
        $2, $3, $4, $5, $6, $7, $8
      )
    `, [
      sessionId,
      role,
      content,
      metadata.model || null,
      metadata.tokens || null,
      metadata.cost || null,
      metadata.responseTime || null,
      metadata.phase || null
    ]);
    
    // Update session cost
    if (metadata.cost) {
      await queryDB(env, `
        UPDATE sessions 
        SET total_cost = total_cost + $1,
            ai_model_used = $2,
            updated_at = NOW()
        WHERE session_id = $3
      `, [metadata.cost, metadata.model, sessionId]);
    }
  } catch (error) {
    console.error('❌ Failed to log message:', error);
  }
}

export async function getConversationHistory(env, sessionId, limit = 50) {
  try {
    return await queryDB(env, `
      SELECT role, content, created_at, conversation_phase
      FROM messages
      WHERE session_id = (SELECT id FROM sessions WHERE session_id = $1)
      ORDER BY created_at ASC
      LIMIT $2
    `, [sessionId, limit]);
  } catch (error) {
    console.error('❌ Failed to get conversation history:', error);
    return [];
  }
}

export async function trackEvent(env, sessionId, eventType, eventData = {}) {
  try {
    await queryDB(env, `
      INSERT INTO analytics_events (session_id, event_type, event_data)
      VALUES (
        (SELECT id FROM sessions WHERE session_id = $1),
        $2, $3
      )
    `, [sessionId, eventType, JSON.stringify(eventData)]);
  } catch (error) {
    console.error('❌ Failed to track event:', error);
  }
}
