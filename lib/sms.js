import { SolapiMessageService } from 'solapi';

// 솔라피(SOLAPI) 문자 발송 헬퍼
// 신청폼(pages/api/apply.js)이 구글시트 저장에 성공한 직후 호출됩니다.
//
// 필요한 Vercel 환경변수 (실제 Vercel에 등록된 이름 기준)
// - solapi_api_key          : 솔라피 API Key
// - solapi_api_key_secret   : 솔라피 API Secret
// - solapi_sender_unmber    : 솔라피 콘솔에 "발신번호"로 등록/본인인증 완료된 번호 (필수)
// - admin_phone_numer       : 신청 접수 알림을 받을 관리자 번호. 여러 명이면 콤마(,)로 구분
//                             (비워두면 관리자 알림은 건너뜁니다)
//
// 위 두 변수명(solapi_sender_unmber, admin_phone_numer)은 실제로 Vercel에 등록하신
// 철자를 그대로 따른 것입니다. 나중에 SOLAPI_SENDER_PHONE / SOLAPI_ADMIN_PHONE 같은
// 정상 철자로 이름을 바꿔 등록하셔도 아래 코드가 그대로 인식하도록 폴백을 넣어뒀습니다.

function getMessageService() {
  const apiKey = process.env.solapi_api_key;
  const apiSecret = process.env.solapi_api_key_secret;

  if (!apiKey || !apiSecret) {
    return null;
  }

  return new SolapiMessageService(apiKey, apiSecret);
}

function normalizePhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '');
}

function getSenderPhone() {
  return normalizePhone(
    process.env.solapi_sender_unmber ||
      process.env.SOLAPI_SENDER_PHONE ||
      process.env.solapi_sender_number
  );
}

function parseAdminPhones() {
  const raw =
    process.env.admin_phone_numer ||
    process.env.SOLAPI_ADMIN_PHONE ||
    process.env.admin_phone_number ||
    '';

  return String(raw)
    .split(',')
    .map((p) => normalizePhone(p))
    .filter(Boolean);
}

/**
 * 상담 신청 접수 문자를 발송합니다.
 * - 관리자에게: 신청 내용 요약 알림 (SOLAPI_ADMIN_PHONE 설정 시)
 * - 신청자에게: 접수 확인 문자 (연락처가 유효한 형태일 때)
 *
 * 문자 발송 실패가 신청 자체(구글시트 저장)를 실패로 만들면 안 되므로,
 * 이 함수는 예외를 던지지 않고 결과 객체를 반환합니다.
 */
export async function sendApplicationSms({ name, phone, grade, subject, message }) {
  const messageService = getMessageService();
  const from = getSenderPhone();

  if (!messageService || !from) {
    console.warn(
      '[sms] solapi_api_key / solapi_api_key_secret / solapi_sender_unmber 환경변수가 설정되어 있지 않아 문자 발송을 건너뜁니다.'
    );
    return { skipped: true };
  }

  const messages = [];

  // 1) 관리자 알림 문자
  const adminPhones = parseAdminPhones();
  if (adminPhones.length > 0) {
    const adminText = [
      '[라온과학 상담신청 접수]',
      `이름: ${name}`,
      `연락처: ${phone}`,
      grade ? `학년: ${grade}` : null,
      subject ? `관심과목: ${subject}` : null,
      message ? `문의내용: ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    adminPhones.forEach((to) => {
      messages.push({ to, from, text: adminText });
    });
  }

  // 2) 신청자 접수 확인 문자
  const applicantPhone = normalizePhone(phone);
  if (applicantPhone.length >= 9) {
    const applicantText = `[라온과학] ${name}님, 상담 신청이 정상 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.`;
    messages.push({ to: applicantPhone, from, text: applicantText });
  }

  if (messages.length === 0) {
    return { skipped: true };
  }

  try {
    const result = await messageService.send(messages);
    return { skipped: false, result };
  } catch (err) {
    console.error('[sms] 솔라피 문자 발송 실패:', err);
    return { skipped: false, error: err };
  }
}
