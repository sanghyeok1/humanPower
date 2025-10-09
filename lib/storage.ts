// lib/storage.ts - JSON 파일 기반 데이터 저장
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const RESUMES_FILE = path.join(DATA_DIR, "resumes.json");
const JOB_POSTINGS_FILE = path.join(DATA_DIR, "jobPostings.json");
const APPLICANTS_FILE = path.join(DATA_DIR, "applicants.json");

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 파일이 없으면 빈 배열로 초기화
function ensureFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
  }
}

// 데이터 읽기
export function readResumes() {
  ensureFile(RESUMES_FILE);
  const data = fs.readFileSync(RESUMES_FILE, "utf-8");
  return JSON.parse(data);
}

export function readJobPostings() {
  ensureFile(JOB_POSTINGS_FILE);
  const data = fs.readFileSync(JOB_POSTINGS_FILE, "utf-8");
  return JSON.parse(data);
}

export function readApplicants() {
  ensureFile(APPLICANTS_FILE);
  const data = fs.readFileSync(APPLICANTS_FILE, "utf-8");
  return JSON.parse(data);
}

// 데이터 쓰기
export function writeResumes(resumes: any[]) {
  fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumes, null, 2), "utf-8");
}

export function writeJobPostings(jobPostings: any[]) {
  fs.writeFileSync(JOB_POSTINGS_FILE, JSON.stringify(jobPostings, null, 2), "utf-8");
}

export function writeApplicants(applicants: any[]) {
  fs.writeFileSync(APPLICANTS_FILE, JSON.stringify(applicants, null, 2), "utf-8");
}
