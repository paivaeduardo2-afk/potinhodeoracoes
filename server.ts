import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Handle favicon to prevent 404s
  app.get("/favicon.ico", (req, res) => res.status(204).end());

  // --- AUTH ROUTES ---

  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios!" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
      const result = stmt.run(email, hashedPassword);
      const token = jwt.sign({ userId: Number(result.lastInsertRowid) }, JWT_SECRET);
      res.json({ token, user: { email, points: 0, used_prayers: [] } });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT") {
        res.status(400).json({ error: "Este email já tem uma conta! Tente entrar." });
      } else {
        res.status(500).json({ error: "Ops! Erro ao criar conta. Tente de novo." });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        return res.status(404).json({ error: "Conta não encontrada. Clique em 'Cadastre-se' abaixo!" });
      }
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Senha incorreta. Tente de novo!" });
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({ 
        token, 
        user: { 
          email: user.email, 
          points: user.points, 
          used_prayers: JSON.parse(user.used_prayers) 
        } 
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // --- PROGRESS ROUTES ---

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

  app.get("/api/progress", authenticateToken, (req: any, res) => {
    const user: any = db.prepare("SELECT points, used_prayers FROM users WHERE id = ?").get(req.user.userId);
    res.json({ 
      points: user.points, 
      used_prayers: JSON.parse(user.used_prayers) 
    });
  });

  app.post("/api/progress", authenticateToken, (req: any, res) => {
    const { points, used_prayers } = req.body;
    try {
      db.prepare("UPDATE users SET points = ?, used_prayers = ? WHERE id = ?")
        .run(points, JSON.stringify(used_prayers), req.user.userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar progresso" });
    }
  });

  // 2. Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // Development mode
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3000
      },
      appType: "spa",
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Explicitly handle index.html for the root and other routes
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
