import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql, { type PoolOptions } from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ===== env helper ===== */
const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};
const JWT_SECRET = env("AUTH_JWT_SECRET"); // .env에 AUTH_JWT_SECRET 필수

/* ===== DB Pool ===== */
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

/* ===== App ===== */
const app = express();
app.use(cors());
app.use(express.json()); // ← 이게 있어야 req.body 읽힘

/* ===== Health ===== */
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* ===== 공고 목록 (페이지네이션) =====
   프론트가 post.dong을 기대하므로 DB의 dong_name을 dong으로 alias */
app.get("/postings", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Number(req.query.pageSize ?? 10))
    );
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT id, title, category, wage_type, wage_amount,
              dong_name AS dong, address, start_date, created_at
       FROM postings
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const [[{ total }]]: any = await pool.query(
      `SELECT COUNT(*) as total FROM postings`
    );

    res.json({ items: rows, page, pageSize, total });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* ===== 파트너 근접 검색 (바운딩박스 + 하버사인) =====
   GET /partners?lat=37.503&lng=126.775&radius=5000 */
app.get("/partners", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusRaw = Number(req.query.radius ?? 10000); // meters
    const radius = Math.min(
      30000,
      Math.max(100, Number.isFinite(radiusRaw) ? radiusRaw : 10000)
    );

    // 좌표 없으면 최신 8개
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const [rows]: any = await pool.query(
        `SELECT id, name, address, logo_url, link_url, tags_json, lat, lng
         FROM partners
         WHERE is_active = 1
         ORDER BY id DESC
         LIMIT 8`
      );
      return res.json({ items: rows });
    }

    // 바운딩박스 1차 필터
    const latDelta = radius / 111_320; // 위도 1도 ≈ 111.32km
    const lngDelta = radius / (111_320 * Math.cos((lat * Math.PI) / 180));

    // 하버사인(미터). 지구 반경 6,371,000m
    const sql = `
      SELECT
        id, name, address, logo_url, link_url, tags_json, lat, lng,
        (6371000 * 2 * ASIN(
          SQRT(
            POW(SIN(RADIANS(? - lat) / 2), 2) +
            COS(RADIANS(lat)) * COS(RADIANS(?)) *
            POW(SIN(RADIANS(? - lng) / 2), 2)
          )
        )) AS dist_m
      FROM partners
      WHERE is_active = 1
        AND lat IS NOT NULL AND lng IS NOT NULL
        AND lat BETWEEN ? AND ?
        AND lng BETWEEN ? AND ?
      HAVING dist_m <= ?
      ORDER BY dist_m ASC
      LIMIT 8
    `;
    const params = [
      lat, // 하버사인
      lat,
      lng,
      lat - latDelta,
      lat + latDelta, // 위도 범위
      lng - lngDelta,
      lng + lngDelta, // 경도 범위
      radius,
    ];

    const [rows]: any = await pool.query(sql, params);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/* ===== 로그인 (폰번호 정규화 + JWT 발급) =====
   POST /auth/login  { phone, password } */
app.post("/auth/login", async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    if (!phone || !password) {
      return res.status(400).json({ error: "missing_fields" });
    }

    // 입력값 정규화: 숫자만 남기고, +82 → 0
    const normalizePhone = (v: string) => {
      const t = String(v).trim();
      let digits = t.replace(/\D/g, ""); // 숫자만
      if (digits.startsWith("8210"))
        digits = "0" + digits.slice(3); // 8210xxxx → 0 + 10xxxx
      else if (digits.startsWith("82")) digits = "0" + digits.slice(2);
      return digits;
    };
    const phoneNorm = normalizePhone(phone);

    // DB 쿼리도 동일한 규칙으로 비교
    const [rows]: any = await pool.query(
      `
      SELECT id, role, phone, display_name, password_hash
      FROM accounts
      WHERE REPLACE(REPLACE(REPLACE(phone, '-', ''), ' ', ''), '+82', '0') = ?
      LIMIT 1
      `,
      [phoneNorm]
    );
    if (!rows.length)
      return res.status(401).json({ error: "invalid_credentials" });

    const acc = rows[0];
    const ok =
      !!acc.password_hash &&
      (await bcrypt.compare(password, acc.password_hash));
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
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/* ===== 내 정보 (토큰 검증) =====
   GET /auth/me  (Authorization: Bearer <token>) */
app.get("/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "unauthorized" });

    const payload: any = jwt.verify(token, JWT_SECRET); // { sub, role, phone, iat, exp }
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

/* ===== Start ===== */
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
