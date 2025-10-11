-- humanpower 데이터베이스 스키마
-- 기존 테이블: accounts, partners, postings

-- ========================================
-- 채팅 테이블
-- ========================================

-- 채팅방
CREATE TABLE IF NOT EXISTS chat_rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  posting_id BIGINT UNSIGNED NOT NULL,
  posting_title VARCHAR(200) NOT NULL,
  employer_id BIGINT UNSIGNED NOT NULL,
  seeker_id BIGINT UNSIGNED NOT NULL,
  last_message TEXT,
  last_message_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unread_count_employer INT NOT NULL DEFAULT 0,
  unread_count_seeker INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_chat (posting_id, employer_id, seeker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 채팅 메시지
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  sender_role ENUM('employer', 'seeker') NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_room_created (room_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 지원자 관리 테이블
-- ========================================

-- 지원자/초대
CREATE TABLE IF NOT EXISTS applicants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  posting_id BIGINT UNSIGNED NOT NULL,
  posting_title VARCHAR(200) NOT NULL,
  employer_id BIGINT UNSIGNED NOT NULL,
  applicant_id BIGINT UNSIGNED NOT NULL,
  applicant_name VARCHAR(60) NOT NULL,
  applicant_phone VARCHAR(20) NOT NULL,
  resume_id BIGINT UNSIGNED,
  status ENUM('applied', 'invited', 'accepted', 'pending', 'rejected', 'noshow', 'completed') NOT NULL DEFAULT 'pending',
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  is_favorite TINYINT(1) NOT NULL DEFAULT 0,
  is_blacklist TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE,
  FOREIGN KEY (employer_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_employer (employer_id),
  INDEX idx_applicant (applicant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 통화 로그
CREATE TABLE IF NOT EXISTS call_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  applicant_id BIGINT UNSIGNED NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note TEXT NOT NULL,
  FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
  INDEX idx_applicant_timestamp (applicant_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 이력서 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS resumes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seeker_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  name VARCHAR(60) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  main_category ENUM('rebar_form_concrete', 'interior_finish', 'mep') NOT NULL,
  skills JSON,
  experience_years INT,
  recent_work_history JSON,
  equipment JSON,
  licenses JSON,
  certificates JSON,
  introduction TEXT,
  desired_wage_type ENUM('day', 'hour', 'month'),
  desired_wage_amount INT,
  available_shift JSON,
  available_start_date DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_seeker (seeker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 템플릿 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS posting_templates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  category ENUM('rebar_form_concrete', 'interior_finish', 'mep') NOT NULL,
  work_period VARCHAR(50),
  work_hours ENUM('day', 'night', 'both'),
  wage_type ENUM('daily', 'hourly', 'monthly'),
  wage_amount VARCHAR(50),
  meals_provided TINYINT(1) DEFAULT 0,
  housing_provided TINYINT(1) DEFAULT 0,
  equipment_provided TINYINT(1) DEFAULT 0,
  address VARCHAR(200),
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  required_people INT,
  role VARCHAR(100),
  summary TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 평가 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS ratings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  employer_id BIGINT UNSIGNED NOT NULL,
  worker_name VARCHAR(60) NOT NULL,
  worker_id BIGINT UNSIGNED,
  posting_title VARCHAR(200) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  work_date DATE NOT NULL,
  is_public TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employer_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES accounts(id) ON DELETE SET NULL,
  INDEX idx_employer (employer_id),
  INDEX idx_worker (worker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 구직자 지원/저장 테이블
-- ========================================

-- 지원 내역
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seeker_id BIGINT UNSIGNED NOT NULL,
  posting_id BIGINT UNSIGNED NOT NULL,
  posting_title VARCHAR(200) NOT NULL,
  posting_category VARCHAR(40) NOT NULL,
  posting_pay VARCHAR(100) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type ENUM('applied', 'invited') NOT NULL DEFAULT 'applied',
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE,
  INDEX idx_seeker (seeker_id),
  UNIQUE KEY unique_application (seeker_id, posting_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 찜한 공고
CREATE TABLE IF NOT EXISTS saved_postings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seeker_id BIGINT UNSIGNED NOT NULL,
  posting_id BIGINT UNSIGNED NOT NULL,
  saved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE,
  INDEX idx_seeker (seeker_id),
  UNIQUE KEY unique_saved (seeker_id, posting_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 최근 본 공고
CREATE TABLE IF NOT EXISTS view_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seeker_id BIGINT UNSIGNED NOT NULL,
  posting_id BIGINT UNSIGNED NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (posting_id) REFERENCES postings(id) ON DELETE CASCADE,
  INDEX idx_seeker_viewed (seeker_id, viewed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 작업 완료 기록
CREATE TABLE IF NOT EXISTS completion_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seeker_id BIGINT UNSIGNED NOT NULL,
  posting_title VARCHAR(200) NOT NULL,
  posting_category VARCHAR(40) NOT NULL,
  work_date DATE NOT NULL,
  pay VARCHAR(100) NOT NULL,
  status ENUM('completed', 'cancelled') NOT NULL DEFAULT 'completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seeker_id) REFERENCES accounts(id) ON DELETE CASCADE,
  INDEX idx_seeker (seeker_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 알림 설정 테이블 (accounts 테이블 확장 대신)
-- ========================================

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  new_applicant TINYINT(1) DEFAULT 1,
  new_message TINYINT(1) DEFAULT 1,
  deadline_reminder TINYINT(1) DEFAULT 1,
  nearby_postings TINYINT(1) DEFAULT 1,
  category_match TINYINT(1) DEFAULT 1,
  wage_match TINYINT(1) DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 구직자 프로필 확장 테이블
-- ========================================

CREATE TABLE IF NOT EXISTS seeker_profiles (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  nickname VARCHAR(60),
  skills JSON,
  experience_years INT,
  recent_work TEXT,
  equipment JSON,
  licenses JSON,
  work_hours ENUM('day', 'night', 'both'),
  desired_wage_type ENUM('daily', 'hourly'),
  desired_wage_amount VARCHAR(50),
  available_immediately TINYINT(1) DEFAULT 0,
  available_from DATE,
  radius_km INT DEFAULT 10,
  preferred_categories JSON,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
