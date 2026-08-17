import Head from 'next/head';
import { useState } from 'react';

const PROGRAMS = [
  {
    tag: '중등',
    title: '중등 통합과학 탐구',
    desc: '개념을 실험으로 먼저 만나고, 교과서로 정리하는 역순 학습 커리큘럼.',
  },
  {
    tag: '고등',
    title: '물리학 I · II',
    desc: '역학·전자기부터 최신 개정 교육과정까지, 개념 흐름을 체계적으로 정리.',
  },
  {
    tag: '고등',
    title: '화학 I · II',
    desc: '몰 개념부터 반응 속도까지, 헷갈리는 단원만 골라 듣는 클리닉 방식.',
  },
  {
    tag: '특강',
    title: '주말 실험 랩',
    desc: '한 달에 한 번, 학교에서 못 해본 실험을 직접 설계하고 기록하는 시간.',
  },
];

const STEPS = [
  '상담 신청서 작성 및 제출',
  '전담 강사 배정 및 수준 진단',
  '커리큘럼 확정 및 첫 수업 안내',
  '매 수업 후 학습 리포트 발송',
];

const GRADES = [
  '중학교 1학년',
  '중학교 2학년',
  '중학교 3학년',
  '고등학교 1학년',
  '고등학교 2학년',
  '고등학교 3학년',
];

export default function Home() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    grade: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setStatus({ state: 'error', message: '이름, 연락처, 이메일은 필수 입력 항목이에요.' });
      return;
    }
    setStatus({ state: 'loading', message: '' });
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '제출 중 오류가 발생했어요.');
      setStatus({ state: 'success', message: '신청이 접수됐어요. 1영업일 이내에 연락드릴게요.' });
      setForm({ name: '', phone: '', email: '', grade: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message || '제출 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
    }
  };

  return (
    <>
      <Head>
        <title>라온과학 | 중·고등 과학 전문 교육</title>
        <meta
          name="description"
          content="중·고등학생을 위한 체계적인 과학 교육, 라온과학. 무료 상담을 신청해보세요."
        />
      </Head>

      <header className="header">
        <div className="container header-inner">
          <div className="logo">
            <span className="logo-mark">RS</span>
            라온과학
          </div>
          <nav className="nav">
            <div className="nav-links" style={{ display: 'flex', gap: 28 }}>
              <a href="#about">소개</a>
              <a href="#programs">프로그램</a>
              <a href="#stats">성과</a>
            </div>
            <a href="#apply" className="nav-cta">
              무료 상담 신청
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero grid-bg-dark">
          <div className="container hero-inner">
            <div>
              <span className="eyebrow">중·고등학생 과학 전문</span>
              <h1>
                체계적으로 배우는 과학,
                <br />
                <span className="underline">라온과학</span>
              </h1>
              <p className="lead">
                감으로 푸는 과학이 아니라 원리로 이해하는 과학. 라온과학은
                중·고등학생의 학업 수준에 맞춘 정밀한 커리큘럼을 제공합니다.
              </p>
              <div className="hero-actions">
                <a href="#apply" className="btn btn-primary">
                  상담 신청하기
                </a>
                <a href="#programs" className="btn btn-ghost">
                  프로그램 둘러보기
                </a>
              </div>
            </div>

            <div className="hero-card">
              <span className="card-label">Raon Science / Overview</span>
              <ul>
                <li>
                  <span>과학 교육 운영</span>
                  <span className="num">12년</span>
                </li>
                <li>
                  <span>수강생 만족도</span>
                  <span className="num">96%</span>
                </li>
                <li>
                  <span>평균 수업 인원</span>
                  <span className="num">1:6</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">라온과학 소개</span>
              <h2>왜 라온과학일까요?</h2>
              <p>정확한 진단과 체계적인 관리로, 흔들리지 않는 과학 실력을 만듭니다.</p>
            </div>
            <div className="grid-3">
              <div className="info-card">
                <span className="idx">01</span>
                <h3>실험 기반 개념 학습</h3>
                <p>모든 단원은 실험 또는 시연으로 시작해, 현상을 원리로 연결합니다.</p>
              </div>
              <div className="info-card">
                <span className="idx">02</span>
                <h3>전담 강사 매칭</h3>
                <p>학생의 학교 진도와 수준에 맞춰 전담 강사를 배정하고 이력을 관리합니다.</p>
              </div>
              <div className="info-card">
                <span className="idx">03</span>
                <h3>투명한 학습 리포트</h3>
                <p>매 수업 후 학부모님께 리포트를 발송해, 학습 현황을 바로 확인할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAMS */}
        <section id="programs" className="section section-alt">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">프로그램</span>
              <h2>학년별 맞춤 과학 수업</h2>
              <p>중등 통합과학부터 고등 물리·화학까지, 필요한 과목만 골라 들을 수 있습니다.</p>
            </div>
            <div className="grid-4">
              {PROGRAMS.map((p) => (
                <div className="program-card" key={p.title}>
                  <span className="program-tag">{p.tag}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section id="stats" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">라온과학의 성과</span>
              <h2>숫자로 보는 라온과학</h2>
            </div>
            <div className="stats">
              <div className="stat-box">
                <div className="stat-num">1,200+</div>
                <div className="stat-label">누적 수강생</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">96%</div>
                <div className="stat-label">재등록률</div>
              </div>
              <div className="stat-box">
                <div className="stat-num">12년</div>
                <div className="stat-label">과학 교육 노하우</div>
              </div>
            </div>
          </div>
        </section>

        {/* APPLY FORM */}
        <section id="apply" className="section section-alt">
          <div className="container form-wrap">
            <div className="form-side">
              <span className="eyebrow">무료 상담 신청</span>
              <h2>
                신청서 제출 후
                <br />
                진행되는 순서예요
              </h2>
              <ul>
                {STEPS.map((step, i) => (
                  <li key={step}>
                    <span className="step mono">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="form-card">
              <form onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="name">
                      이름 <span className="req">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="학생 이름"
                      value={form.name}
                      onChange={update('name')}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="grade">학년</label>
                    <select id="grade" value={form.grade} onChange={update('grade')}>
                      <option value="">선택해주세요</option>
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="phone">
                      연락처 <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={form.phone}
                      onChange={update('phone')}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">
                      이메일 <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={form.email}
                      onChange={update('email')}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="subject">관심 과목</label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="예: 통합과학, 화학 I"
                    value={form.subject}
                    onChange={update('subject')}
                  />
                </div>

                <div className="field">
                  <label htmlFor="message">문의 내용</label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="궁금한 점을 남겨주세요"
                    value={form.message}
                    onChange={update('message')}
                  />
                </div>

                <button type="submit" className="submit-btn" disabled={status.state === 'loading'}>
                  {status.state === 'loading' ? '접수 중...' : '무료 상담 신청하기'}
                </button>

                {status.state === 'success' && (
                  <div className="status-msg success">{status.message}</div>
                )}
                {status.state === 'error' && (
                  <div className="status-msg error">{status.message}</div>
                )}

                <p className="form-note">
                  입력하신 정보는 상담 목적으로만 사용되며, 별도 동의 없이 제3자에게 제공되지 않습니다.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="logo">
              <span className="logo-mark">RS</span>라온과학
            </div>
            <div className="footer-info">
              라온과학 · 과학교육 전문 브랜드
              <br />
              중·고등학생을 위한 체계적 과학 수업
              <br />
              문의: hello@raon-science.example
            </div>
          </div>
          <div className="footer-bottom">© 2026 RAON SCIENCE. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
