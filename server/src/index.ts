import "dotenv/config";
import express from "express";
import cors from "cors";
import mysql, { type PoolOptions } from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// --- env helper: 없으면 즉시 에러 ---
const env = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
};

// --- DB 설정 ---
const dbConfig = {
  host: env("DB_HOST"),
  port: Number(process.env.DB_PORT ?? 3306),
  user: env("DB_USER"),
  password: env("DB_PASS"),
  database: env("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
} satisfies PoolOptions;

// --- 커넥션 풀 ---
const pool = mysql.createPool(dbConfig);

// 헬스체크
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 예시: 공고 목록(페이지네이션)
app.get("/postings", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Number(req.query.pageSize ?? 10))
    );
    const offset = (page - 1) * pageSize;

    const [rows] = await pool.query(
      `SELECT id, title, category, wage_type, wage_amount, dong, address, start_date, created_at
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

// 위치기반 파트너 목록: 바운딩박스(+복합인덱스) + 하버사인
// GET /partners?lat=37.503&lng=126.775&radius=5000
app.get("/partners", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusRaw = Number(req.query.radius ?? 10000); // meters
    const radius = Math.min(
      30000,
      Math.max(100, Number.isFinite(radiusRaw) ? radiusRaw : 10000)
    );

    // 위치 파라미터가 없으면 최신 8개
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

    // 바운딩 박스(사각형) 1차 필터
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

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
