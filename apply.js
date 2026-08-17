import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// 신청폼 데이터를 저장할 시트 ID
// (시트 링크 https://docs.google.com/spreadsheets/d/<이 부분>/edit... 에서 추출)
// 다른 시트를 쓰신다면 이 값을 바꾸거나, Vercel에 GOOGLE_SHEET_ID 환경변수를 추가하세요.
const DEFAULT_SHEET_ID = '1gkh9HSiMb12Qu1vk74_NyI0GntiGjV0v7zfHkIArlPA';
const SHEET_HEADERS = ['신청일시', '이름', '연락처', '이메일', '학년', '관심과목', '문의내용'];

async function getSheet() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;

  if (!email || !rawKey) {
    throw new Error(
      '서버에 GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY 환경변수가 설정되어 있지 않습니다.'
    );
  }

  const jwt = new JWT({
    email,
    // Vercel 환경변수에 줄바꿈이 \n 텍스트로 저장되는 경우를 대비한 변환
    key: rawKey.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(sheetId, jwt);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  // 첫 실행 시 헤더가 없다면 자동으로 만들어줍니다.
  await sheet.loadHeaderRow().catch(async () => {
    await sheet.setHeaderRow(SHEET_HEADERS);
  });

  return sheet;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
  }

  const { name, phone, email, grade, subject, message } = req.body || {};

  if (!name || !phone || !email) {
    return res.status(400).json({ error: '이름, 연락처, 이메일은 필수 입력 항목입니다.' });
  }

  try {
    const sheet = await getSheet();

    await sheet.addRow({
      신청일시: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      이름: name,
      연락처: phone,
      이메일: email,
      학년: grade || '',
      관심과목: subject || '',
      문의내용: message || '',
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[apply] Google Sheets 저장 실패:', err);
    return res.status(500).json({
      error: '신청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
}
