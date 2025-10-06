import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql, { type PoolOptions } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---- env helper (이미 있다면 중복 제거)
const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};
const JWT_SECRET = env("AUTH_JWT_SECRET");

// ---- DB 풀
const dbConfig = {
  host: env("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  user: env("DB_USER"),
  password: env("DB_PASS"),
  database: env("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
} satisfies PoolOptions;
const pool = mysql.createPool(dbConfig);

// ---- app
const app = express();
app.use(cors());
app.use(express.json());

// 헬스체크
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 로그인
app.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password)
    return res.status(400).json({ error: "missing_fields" });

  const [rows]: any = await pool.query(
    `SELECT id, role, phone, display_name, password_hash
     FROM accounts WHERE phone=? LIMIT 1`,
    [phone]
  );
  if (!rows.length)
    return res.status(401).json({ error: "invalid_credentials" });

  const acc = rows[0];
  const ok =
    !!acc.password_hash && (await bcrypt.compare(password, acc.password_hash));
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = jwt.sign(
    { sub: String(acc.id), role: acc.role, phone: acc.phone },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    account: {
      id: acc.id,
      role: acc.role,
      phone: acc.phone,
      display_name: acc.display_name,
    },
  });
});

// 로그인 상태 확인
app.get("/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const payload: any = jwt.verify(token, JWT_SECRET);

    const [rows]: any = await pool.query(
      `SELECT id, role, phone, display_name FROM accounts WHERE id=? LIMIT 1`,
      [payload.sub]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
