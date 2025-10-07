import type { RowDataPacket, OkPacket } from "mysql2/promise";
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

/* ======== 계정 유효성 규칙 ======== */
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

function normalizePhone(p: string) {
  return String(p || "").replace(/\D/g, "");
}

/** 아이디 중복 확인 (DB 기준)
 *  POST /auth/check-username  { username }
 *  -> { ok: true, available: boolean, reason?: 'invalid_format' }
 */
app.post("/auth/check-username", async (req, res) => {
  try {
    const { username } = req.body ?? {};
    if (!username) {
      return res.status(400).json({ ok: false, error: "missing_username" });
    }
    if (!USERNAME_RE.test(username)) {
      return res.json({ ok: true, available: false, reason: "invalid_format" });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM accounts WHERE username = ? LIMIT 1",
      [username]
    );
    const taken = rows.length > 0;
    return res.json({ ok: true, available: !taken });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
});

/** 구직자 회원가입
 *  POST /auth/signup/seeker
 *  body:
 *  {
 *    "name": "홍길동",
 *    "username": "gildong",
 *    "phone": "010-1234-5678",
 *    "password": "Passw0rd!",
 *    "postalCode": "12345",
 *    "roadAddress": "경기 부천시 ... 계남로 329",
 *    "detailAddress": "806호",
 *    "lat": 37.503,
 *    "lng": 126.766
 *  }
 *  -> { ok: true, id: number }
 */
app.post("/auth/signup/seeker", async (req, res) => {
  try {
    const {
      name, // 화면에서 입력한 "이름"
      username, // 아이디
      phone, // 전화번호(숫자만 저장)
      password, // 비밀번호 원문 -> 해시 저장
      postalCode,
      roadAddress,
      detailAddress,
      lat,
      lng,
    } = req.body ?? {};

    // --- 입력 검증 ---
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ ok: false, error: "invalid_name" });
    }
    if (!USERNAME_RE.test(username ?? "")) {
      return res.status(400).json({ ok: false, error: "invalid_username" });
    }
    const p = normalizePhone(phone);
    if (p.length < 10 || p.length > 11) {
      return res.status(400).json({ ok: false, error: "invalid_phone" });
    }
    if (!PASSWORD_RE.test(password ?? "")) {
      return res.status(400).json({ ok: false, error: "weak_password" });
    }
    // 좌표 필수(원하면 완화 가능)
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return res.status(400).json({ ok: false, error: "invalid_coords" });
    }

    // --- 중복 체크 ---
    const [dups] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, phone FROM accounts WHERE username=? OR phone=? LIMIT 1",
      [username, p]
    );
    if (dups.length > 0) {
      const d = dups[0];
      if (String(d.username) === String(username)) {
        return res.status(409).json({ ok: false, error: "username_taken" });
      }
      if (String(d.phone) === String(p)) {
        return res.status(409).json({ ok: false, error: "phone_taken" });
      }
      return res.status(409).json({ ok: false, error: "duplicated" });
    }

    // --- 비밀번호 해시 ---
    const hash = await bcrypt.hash(String(password), 12);

    // --- 저장 ---
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO accounts
       (role, username, phone, password_hash, business_no, display_name, status,
        postal_code, road_address, detail_address, lat, lng, created_at, updated_at)
       VALUES
       ('seeker', ?, ?, ?, NULL, ?, 'active',
        ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        username,
        p,
        hash,
        name, // display_name에 이름 저장
        postalCode || null,
        roadAddress || null,
        detailAddress || null,
        Number(lat),
        Number(lng),
      ]
    );

    return res.json({ ok: true, id: result.insertId });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
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

// server/src/index.ts 중 기존 app.post('/auth/login', ...) 전부 교체

// ===== 교체본: 아이디/비번 로그인 =====
// POST /auth/login  { username, password }
app.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "missing_params" });
    }

    // 아이디 기준으로 조회
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, role, username, display_name, status, password_hash, phone
         FROM accounts
        WHERE username = ?
        LIMIT 1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ ok: false, error: "invalid_credentials" });
    }

    const user = rows[0] as any;

    // 비활성 계정 차단
    if (user.status !== "active") {
      return res.status(403).json({ ok: false, error: "inactive_account" });
    }

    // 비밀번호 확인
    const hash: string | null = user.password_hash ?? null;

    // 🔹 개발 편의: 예전 더미값이 있으면 "1111" 허용 (운영 배포 전 제거 권장)
    let ok = false;
    if (hash && hash.startsWith("$2")) {
      ok = await bcrypt.compare(String(password), hash);
    } else if (hash && String(hash).includes("HASH1111")) {
      ok = String(password) === "1111";
    } else {
      ok = false;
    }

    if (!ok) {
      return res.status(401).json({ ok: false, error: "invalid_credentials" });
    }

    // 토큰 발급
    const token = jwt.sign(
      { sub: String(user.id), typ: "hp", role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 응답 (기존 프론트 호환을 위해 account도 함께 내려줌)
    return res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        display_name: user.display_name,
      },
      account: {
        id: user.id,
        role: user.role,
        username: user.username,
        phone: user.phone ?? null,
        display_name: user.display_name,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "server_error" });
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

/* ===== 내 계정(프로필) 조회: 좌표 포함 =====
 * GET /accounts/:id
 * - 인증 필요: Bearer 토큰
 * - admin은 아무 id나 조회 가능, 일반 사용자는 자기 계정만 조회 가능
 */
app.get("/accounts/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ ok: false, error: "bad_id" });
  }

  try {
    // --- 토큰 검증 ---
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token)
      return res.status(401).json({ ok: false, error: "unauthorized" });

    const payload: any = jwt.verify(token, JWT_SECRET); // { sub, role, ... }

    // admin이 아니면 자기 자신만 조회 허용
    if (payload.role !== "admin" && String(payload.sub) !== String(id)) {
      return res.status(403).json({ ok: false, error: "forbidden" });
    }

    // --- 조회 ---
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, role, username, display_name, phone,
              postal_code, road_address, detail_address,
              lat, lng
         FROM accounts
        WHERE id = ?
        LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }

    return res.json({ ok: true, account: rows[0] });
  } catch (e) {
    console.error(e);
    // 토큰 만료/서명 실패 등도 여기로 들어올 수 있음
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
});

/* ===== Start ===== */
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on ${port}`));
