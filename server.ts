import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Initialize environment variables immediately
dotenv.config();

// Lazy load database to prevent startup crashes
let db: any;
const getDb = async () => {
  if (!db) {
    try {
      // Import dynamically to avoid top-level execution issues
      // In a real app, we'd use a more robust singleton pattern
      const Database = (await import('better-sqlite3')).default;
      const dbPath = path.join(process.cwd(), 'potinho.db');
      db = new Database(dbPath);
      console.log(`[DB] Database initialized at ${dbPath}`);
      
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          points INTEGER DEFAULT 0,
          used_prayers TEXT DEFAULT '[]'
        )
      `);
    } catch (err) {
      console.error("[DB] Failed to initialize database:", err);
      throw err;
    }
  }
  return db;
};

console.log("[SERVER] Starting initialization...");

process.on('uncaughtException', (err) => {
  console.error('[SERVER] UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  // Use PORT from environment (required for Cloud Run) or default to 3000 (required for AI Studio)
  const PORT = Number(process.env.PORT) || 3000;

  // --- LOGGING FIRST ---
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[SERVER] ${timestamp} - ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
      const safeBody = req.body ? { ...req.body } : {};
      if (safeBody.password) safeBody.password = '***';
      console.log(`[SERVER] Body:`, JSON.stringify(safeBody));
    }
    next();
  });

  // --- API ROUTES ---
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // Body parser for other API routes
  app.use(express.json());

  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    console.log(`[API] Register attempt: ${email}`);
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios!" });
    }
    try {
      const database = await getDb();
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = database.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
      const result = stmt.run(email, hashedPassword);
      const token = jwt.sign({ userId: Number(result.lastInsertRowid) }, JWT_SECRET);
      console.log(`[API] Register success: ${email}`);
      res.json({ token, user: { email, points: 0, used_prayers: [] } });
    } catch (error: any) {
      console.error("[API] Register error:", error);
      if (error.code === "SQLITE_CONSTRAINT") {
        res.status(400).json({ error: "Este email já tem uma conta! Tente entrar. 🏠" });
      } else {
        res.status(500).json({ error: "Erro ao criar conta. Tente novamente." });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`[API] Login attempt: ${email}`);
    try {
      const database = await getDb();
      const user: any = database.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        return res.status(404).json({ error: "Conta não encontrada. Cadastre-se primeiro! ✨" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Senha incorreta. Tente de novo! 🔑" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      console.log(`[API] Login success: ${email}`);
      res.json({ 
        token, 
        user: { 
          email: user.email, 
          points: user.points, 
          used_prayers: JSON.parse(user.used_prayers) 
        } 
      });
    } catch (error) {
      console.error("[API] Login error:", error);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  });

  // Development only: Reset database
  app.post("/api/auth/reset-dev", async (req, res) => {
    try {
      const database = await getDb();
      database.transaction(() => {
        database.prepare("DELETE FROM users").run();
        // Try to reset sequence, ignore if it doesn't exist (e.g. fresh DB)
        try {
          database.prepare("DELETE FROM sqlite_sequence WHERE name='users'").run();
        } catch (e) {}
      })();
      console.log("[API] Database reset by user request.");
      res.json({ success: true, message: "Banco de dados resetado com sucesso! Agora você pode criar uma nova conta. ✨" });
    } catch (error) {
      console.error("[API] Reset error:", error);
      res.status(500).json({ error: "Erro ao resetar banco de dados." });
    }
  });

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  app.get("/api/progress", authenticateToken, async (req: any, res) => {
    try {
      const database = await getDb();
      const user: any = database.prepare("SELECT points, used_prayers FROM users WHERE id = ?").get(req.user.userId);
      res.json({ 
        points: user.points, 
        used_prayers: JSON.parse(user.used_prayers) 
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar progresso" });
    }
  });

  app.post("/api/progress", authenticateToken, async (req: any, res) => {
    const { points, used_prayers } = req.body;
    try {
      const database = await getDb();
      database.prepare("UPDATE users SET points = ?, used_prayers = ? WHERE id = ?")
        .run(points, JSON.stringify(used_prayers), req.user.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar progresso" });
    }
  });

  // Catch-all for /api to prevent returning HTML on 404s
  app.all("/api/*", (req, res) => {
    console.log(`[API] 404 Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // 1. Handle favicon to prevent 404s
  app.get("/favicon.ico", (req, res) => res.status(204).end());

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({ error: "Erro interno no servidor. Tente novamente." });
  });

  // Determine if we are in production
  // Cloud Run provides PORT (usually 8080), AI Studio provides 3000
  const isProduction = process.env.NODE_ENV === "production" || (!!process.env.PORT && process.env.PORT !== "3000");
  
  console.log(`[SERVER] Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`[SERVER] PORT: ${PORT}`);

  if (isProduction) {
    const distPath = path.join(process.cwd(), "dist");
    console.log(`[SERVER] Production mode: serving static files from ${distPath}`);
    
    if (!fs.existsSync(distPath)) {
      console.error(`[SERVER FATAL] dist directory not found at ${distPath}.`);
      console.error(`[SERVER FATAL] Current directory: ${process.cwd()}`);
      console.error(`[SERVER FATAL] Files: ${fs.readdirSync(process.cwd()).join(', ')}`);
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send(`
          <h1>Erro de Configuração</h1>
          <p>A pasta 'dist' não foi encontrada. Certifique-se de rodar 'npm run build' antes do deploy.</p>
          <p>Caminho tentado: ${indexPath}</p>
        `);
      }
    });
  } else {
    // Development mode
    console.log("[SERVER] Starting Vite in development mode...");
    try {
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          watch: {
            usePolling: true,
            interval: 100
          }
        },
        appType: "spa",
      });

      app.use(vite.middlewares);
      
      app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api')) return next();
        
        try {
          const indexPath = path.join(process.cwd(), "index.html");
          if (!fs.existsSync(indexPath)) {
            console.error(`[VITE ERROR] index.html not found at ${indexPath}`);
            return res.status(500).send("index.html not found");
          }
          let template = fs.readFileSync(indexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e) {
          console.error(`[VITE ERROR] Failed to serve index.html for ${url}:`, e);
          vite.ssrFixStacktrace(e as Error);
          next(e);
        }
      });
      console.log("[SERVER] Vite middleware initialized.");
    } catch (viteInitError) {
      console.error("[SERVER] Failed to initialize Vite:", viteInitError);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] >>> SUCCESS <<< Server is listening on port ${PORT}`);
    console.log(`[SERVER] Local: http://localhost:${PORT}`);
    console.log(`[SERVER] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

console.log("[SERVER] Calling startServer()...");
startServer().catch(err => {
  console.error("[SERVER] FATAL ERROR during startServer:", err);
});
