// db/connection.js
export async function queryDB(env, query, params = []) {
  if (!env.DB) {
    throw new Error('Database binding (DB) not found. Check wrangler.toml');
  }

  try {
    console.log('🔍 Query:', query.substring(0, 100) + '...');
    console.log('📊 Params:', JSON.stringify(params));

    const stmt = env.DB.prepare(query);
    
    if (params && params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        stmt.bind(params[i]);
      }
    }
    
    const result = await stmt.all();
    console.log('✅ Rows:', result.results?.length || 0);
    
    return result.results || [];
  } catch (error) {
    console.error('❌ DB Error:', error.message);
    throw new Error(`Database error: ${error.message}`);
  }
}

export async function queryDBSingle(env, query, params = []) {
  const results = await queryDB(env, query, params);
  return results.length > 0 ? results[0] : null;
}

export async function queryDBRaw(env, query, params = []) {
  if (!env.DB) {
    throw new Error('Database binding (DB) not found');
  }

  try {
    const stmt = env.DB.prepare(query);
    
    if (params && params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        stmt.bind(params[i]);
      }
    }
    
    return await stmt.run();
  } catch (error) {
    console.error('❌ Raw query failed:', error.message);
    throw error;
  }
}
