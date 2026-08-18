# 라온과학 홈페이지 (네이비 버전)

중·고등학생 대상 과학 교육 브랜드 "라온과학"의 소개 페이지 + 상담 신청폼입니다.
신청폼 데이터는 서버(API Route)를 거쳐 구글 시트에 자동 저장됩니다.

- 프레임워크: Next.js (Pages Router)
- 시트 저장: `google-spreadsheet` + `google-auth-library` (서비스 계정 인증)
- 문자 발송: `solapi` (솔라피 SDK) — 신청 접수 시 관리자 알림 + 신청자 확인 문자
- 환경변수: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `solapi_api_key`,
  `solapi_api_key_secret`, `solapi_sender_unmber`, `admin_phone_numer`
  (Vercel에 등록 완료 기준)

---

## 현재 설정 기준

이미 아래 두 가지가 되어 있다고 하셨어요.

- Vercel 환경변수에 `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` 등록 완료
- 해당 서비스 계정에 구글 드라이브 권한 부여 완료

**단, 서비스 계정에 "드라이브 전체 권한"을 준 것과 "그 시트 파일 자체를 공유"한 것은 다릅니다.**
`google-spreadsheet` 라이브러리는 시트를 직접 열 때 그 시트에 서비스 계정이
**편집자로 공유되어 있어야** 접근할 수 있습니다. 아래 순서로 한 번 더 확인해주세요.

1. 저장 대상 시트를 엽니다.
2. 우측 상단 **공유** 클릭
3. `GOOGLE_CLIENT_EMAIL`에 등록한 주소(예: `xxx@xxx.iam.gserviceaccount.com`)를
   **편집자(Editor)** 권한으로 추가

또한 코드에는 기본 저장 대상 시트 ID가 다음으로 하드코딩되어 있습니다.

```
1gkh9HSiMb12Qu1vk74_NyI0GntiGjV0v7zfHkIArlPA
```

실제 저장하고 싶은 시트가 다르다면 `pages/api/apply.js`의 `DEFAULT_SHEET_ID` 값을
바꾸거나, Vercel에 `GOOGLE_SHEET_ID` 환경변수를 추가로 등록하세요.

## 문자(SMS) 발송 — 솔라피(SOLAPI)

신청폼이 구글 시트 저장에 성공한 직후, `lib/sms.js`가 솔라피로 문자 두 종류를 보냅니다.

1. **관리자 알림**: 신청자 이름/연락처/학년/관심과목/문의내용 요약을 관리자 번호로 발송
2. **신청자 확인**: "상담 신청이 정상 접수되었습니다" 확인 문자를 신청자 연락처로 발송

문자 발송이 실패해도 구글 시트 저장(신청 접수 자체)은 영향을 받지 않습니다
(에러는 서버 로그에만 남고, 사용자에게는 정상 접수로 응답합니다).

### 필요한 환경변수

| 변수명 | 설명 |
| --- | --- |
| `solapi_api_key` | 솔라피 콘솔 > API Key 관리에서 발급한 API Key |
| `solapi_api_key_secret` | 위 API Key의 Secret |
| `solapi_sender_unmber` | 솔라피 콘솔에 **발신번호로 등록/본인인증 완료된 번호** (하이픈 없이 숫자만). 등록 안 된 번호는 발신 자체가 거부됩니다 |
| `admin_phone_numer` | 신청 접수 알림을 받을 관리자(원장님) 번호. 여러 명이면 콤마(,)로 구분. 비워두면 관리자 알림만 생략되고 신청자 확인 문자는 계속 발송됩니다 |

> 변수명 철자(`solapi_sender_unmber`, `admin_phone_numer`)는 이미 Vercel에 등록하신
> 이름을 그대로 맞춘 것입니다. 코드에는 `SOLAPI_SENDER_PHONE` / `SOLAPI_ADMIN_PHONE`
> 같은 정상 철자로 등록해도 인식하도록 폴백을 넣어뒀으니, 나중에 이름을 바로잡아도
> 코드를 다시 고칠 필요는 없습니다.

발신번호(`solapi_sender_unmber`)가 솔라피에 **발신번호로 사전 등록/인증**되어 있지
않으면 문자 발송이 실패합니다. 솔라피 콘솔 > 발신번호 관리에서 등록 상태를 먼저
확인해주세요.

## 로컬 실행

```bash
npm install
cp .env.local.example .env.local
# .env.local 파일을 열어 GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY 값을 채워주세요.
npm run dev
```

## 배포 (Vercel)

이미 환경변수를 등록하셨다면, 이 코드를 그대로 GitHub에 푸시하고 Vercel에
연결된 저장소라면 자동으로 재배포됩니다. 배포 후 실제 사이트에서 폼을
제출해 시트에 행이 추가되는지 확인해보세요.

문제가 있다면 Vercel 프로젝트의 **Deployments > 해당 배포 > Functions 로그**에서
`/api/apply` 요청의 에러 메시지를 확인할 수 있습니다. 자주 발생하는 원인은:

- 서비스 계정이 해당 시트에 공유되어 있지 않음 → 위 1번 참고
- `GOOGLE_PRIVATE_KEY`를 붙여넣을 때 줄바꿈이 깨짐 → Vercel 환경변수 입력창에
  JSON 키 파일의 `private_key` 값을 그대로(따옴표 없이) 붙여넣으면 됩니다.
- Google Sheets API가 프로젝트에서 활성화되어 있지 않음
- (문자 미발송 시) `solapi_api_key` / `solapi_api_key_secret` / `solapi_sender_unmber`
  중 하나라도 비어있음 → 함수 로그에 `[sms] ... 문자 발송을 건너뜁니다` 경고가 남습니다
- (문자 발송 실패 시) 발신번호가 솔라피에 등록/인증되지 않았거나, 잔여 포인트가 없음

## 폴더 구조

```
raon-science-navy/
├─ pages/
│  ├─ index.js        # 랜딩페이지 (히어로/소개/프로그램/성과/신청폼)
│  ├─ _app.js
│  └─ api/
│     └─ apply.js      # 신청폼 → 구글 시트 저장 + 솔라피 문자 발송 API
├─ lib/
│  └─ sms.js            # 솔라피(SOLAPI) 문자 발송 헬퍼
├─ styles/
│  └─ globals.css       # 네이비 · 그래프 용지 컨셉 디자인 시스템
├─ .env.local.example
└─ package.json
```
