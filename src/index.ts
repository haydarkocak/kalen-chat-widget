import { Client } from "pg";

export default {
  async fetch(request, env, ctx) {
    const client = new Client({ 
      connectionString: env.HYPERDRIVE.connectionString 
    });
    
    await client.connect();

    try {
      const result = await client.query("SELECT NOW() as current_time, version() as pg_version");
      ctx.waitUntil(client.end());

      return Response.json({
        success: true,
        message: "Hyperdrive bağlantısı başarılı!",
        data: {
          current_time: result.rows[0].current_time,
          postgresql_version: result.rows[0].pg_version
        }
      });
      
    } catch (e) {
      return Response.json({ 
        success: false,
        error: e instanceof Error ? e.message : String(e)
      }, { 
        status: 500 
      });
    }
  },
};
