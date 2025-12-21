// session/manager.js
import { queryDB, queryDBSingle } from '../db/connection.js';

export async function getOrCreateSession(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  
  console.log(`🔍 Looking for session from IP: ${ip}`);
  
  try {
    // Son 24 saat içindeki session'ı ara
    const existingSession = await queryDBSingle(env, `
      SELECT * FROM sessions 
      WHERE ip_address = $1 
        AND last_activity > NOW() - INTERVAL '24 hours'
      ORDER BY last_activity DESC 
      LIMIT 1
    `, [ip]);
    
    if (existingSession) {
      // Session'ı güncelle
      await queryDB(env, `
        UPDATE sessions 
        SET last_activity = NOW(), 
            message_count = message_count + 1,
            updated_at = NOW()
        WHERE id = $1
      `, [existingSession.id]);
      
      console.log(`🔄 Returning user: ${existingSession.name || 'Anonymous'}`);
      
      return {
        isReturning: true,
        session: existingSession,
        greeting: buildReturningGreeting(existingSession)
      };
    }
    
    // Yeni session oluştur
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSession = await queryDBSingle(env, `
      INSERT INTO sessions (session_id, ip_address, user_agent)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sessionId, ip, userAgent]);
    
    console.log(`✨ New user from IP ${ip}`);
    
    return {
      isReturning: false,
      session: newSession,
      greeting: null
    };
  } catch (error) {
    console.error('❌ Session management error:', error);
    throw error;
  }
}

function buildReturningGreeting(session) {
  const name = session.name ? `${session.name}` : '';
  const lastPhase = session.current_phase;
  
  if (session.language === 'tr') {
    if (lastPhase === 'MEETING') {
      return `Tekrar hoş geldiniz ${name}! Görüşme planımızı konuşmaya devam edelim mi?`;
    } else if (lastPhase === 'VERIFY') {
      return `Merhaba ${name}, değerlendirmemiz tamamlandı. Sonuçları paylaşmak ister misiniz?`;
    } else if (session.outcome === 'abandoned') {
      return `Tekrar hoş geldiniz ${name}! Kaldığımız yerden devam edelim mi?`;
    }
    return `Hoş geldiniz ${name}! Size nasıl yardımcı olabiliriz?`;
  } else {
    if (lastPhase === 'MEETING') {
      return `Welcome back ${name}! Shall we continue discussing our meeting?`;
    } else if (lastPhase === 'VERIFY') {
      return `Hello ${name}, our evaluation is complete. Would you like to hear the results?`;
    } else if (session.outcome === 'abandoned') {
      return `Welcome back ${name}! Shall we continue where we left off?`;
    }
    return `Welcome back ${name}! How can we help you today?`;
  }
}

export async function updateSessionInfo(env, sessionId, contactInfo) {
  try {
    await queryDB(env, `
      UPDATE sessions 
      SET name = COALESCE($1, name),
          company = COALESCE($2, company),
          email = COALESCE($3, email),
          phone = COALESCE($4, phone),
          position = COALESCE($5, position),
          updated_at = NOW()
      WHERE session_id = $6
    `, [
      contactInfo.name || null,
      contactInfo.company || null,
      contactInfo.email || null,
      contactInfo.phone || null,
      contactInfo.position || null,
      sessionId
    ]);
  } catch (error) {
    console.error('❌ Failed to update session info:', error);
  }
}

export async function updateSessionPhase(env, sessionId, newPhase) {
  try {
    await queryDB(env, `
      UPDATE sessions 
      SET current_phase = $1,
          updated_at = NOW()
      WHERE session_id = $2
    `, [newPhase, sessionId]);
  } catch (error) {
    console.error('❌ Failed to update session phase:', error);
  }
}
