// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  // TODO: 아래 사업자 정보는 실제 값으로 교체
  const BIZ = {
    brand: "바로일감",
    corpName: "㈜예시컴퍼니", // 상호(법인명)
    owner: "홍길동", // 대표자
    bizNo: "000-00-00000", // 사업자등록번호
    mailOrderNo: "제2025-부천-0000호", // 통신판매업 신고번호(해당 시)
    address: "경기 부천시 ○○로 00, 0층 (○○동)",
    csEmail: "support@example.com",
    csPhone: "010-0000-0000",
    dpo: "개인정보보호책임자: 김담당(dpo@example.com)", // 개인정보보호책임자
    host: "Amazon Web Services(AWS)", // 호스팅 제공자
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        {/* 좌측: 고지/면책 */}
        <section className="f-col">
          <h4 className="f-title">{BIZ.brand}</h4>
          <ul className="f-bullets">
            <li>
              본 서비스는 <strong>직업정보 제공 서비스</strong>이며{" "}
              <strong>직접적인 알선·중개·파견</strong>을 제공하지 않습니다.
            </li>
            <li>
              게시물의 내용(임금/근무조건/위치 등)은{" "}
              <strong>게시자 책임</strong>이며, 채용·근로계약 및 임금지급 등
              법률상 책임은 당사자에게 있습니다.
            </li>
            <li>
              파트너 배너/상단고정 등 <strong>유료 노출은 광고</strong>입니다.
            </li>
            <li>야간 시간(21:00–08:00)에는 알림 발송을 제한합니다.</li>
            <li>
              허위·과장·불법 게시물은 신고해주세요. 확인 후 게시
              중단/제재됩니다.
            </li>
          </ul>

          <nav className="f-links">
            <Link href="/terms">이용약관</Link>
            <span aria-hidden>·</span>
            <Link href="/privacy">개인정보처리방침</Link>
            <span aria-hidden>·</span>
            <Link href="/youth">청소년보호정책</Link>
            <span aria-hidden>·</span>
            <Link href="/ad">광고표시정책</Link>
            <span aria-hidden>·</span>
            <Link href="/report">신고/문의</Link>
          </nav>
        </section>

        {/* 우측: 사업자 정보 */}
        <section className="f-col">
          <h5 className="f-subtitle">사업자 정보</h5>
          <dl className="biz">
            <div>
              <dt>상호</dt>
              <dd>{BIZ.corpName}</dd>
            </div>
            <div>
              <dt>대표</dt>
              <dd>{BIZ.owner}</dd>
            </div>
            <div>
              <dt>사업자등록번호</dt>
              <dd>{BIZ.bizNo}</dd>
            </div>
            <div>
              <dt>통신판매업</dt>
              <dd>{BIZ.mailOrderNo}</dd>
            </div>
            <div>
              <dt>주소</dt>
              <dd>{BIZ.address}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>
                <a href={`mailto:${BIZ.csEmail}`}>{BIZ.csEmail}</a>
              </dd>
            </div>
            <div>
              <dt>고객센터</dt>
              <dd>
                <a href={`tel:${BIZ.csPhone}`}>{BIZ.csPhone}</a>
              </dd>
            </div>
            <div>
              <dt>호스팅</dt>
              <dd>{BIZ.host}</dd>
            </div>
            <div>
              <dt>개인정보보호책임자</dt>
              <dd>{BIZ.dpo}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="site-footer__tail">
        <small className="legal-small">
          © {year} {BIZ.corpName}. 일부 콘텐츠는 게시자/제휴사의 소유입니다.
          요청 시 권리침해 신고에 따라 조치합니다. 본 고지/정책은 안내용이며,
          최종 법적 해석/책임은 관계 법령 및 개별 약관에 따릅니다.
        </small>
      </div>
    </footer>
  );
}
