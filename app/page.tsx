'use client'
import { useState, useRef, useEffect } from 'react'

const CHIPS = [
  '쇼핑몰 채널별 매출 분석해줘',
  '미수금 회수 우선순위 알려줘',
  '부가세 신고 전 확인할 항목은?',
  '스마트스토어 불일치 원인이 뭘까?',
  '이번 달 매출 증가 원인 분석해줘',
  '은행 미반영 입금 처리 방법 알려줘',
]

type Msg = { role: 'user' | 'assistant'; content: string }

export default function Dashboard() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncTime] = useState('2026년 3월 28일 09:14')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function ask(q: string) {
    if (!q.trim() || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const { text } = await res.json()
      setMessages([...next, { role: 'assistant', content: text }])
    } catch {
      setMessages([...next, { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 상단 네비 */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-slate-800">
            <span className="text-blue-700">One</span>Plus
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">재무 현황판</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{syncTime} 동기화</span>
          <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-800 font-medium border border-green-200">
            실시간 연동 중
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* 연동 소스 */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '더존 ERP', color: 'bg-blue-500' },
            { label: '스마트스토어', color: 'bg-red-500' },
            { label: '쿠팡', color: 'bg-green-600' },
            { label: '국민은행', color: 'bg-amber-600' },
            { label: '전자세금계산서', color: 'bg-purple-700' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              {s.label}
            </div>
          ))}
        </div>

        {/* KPI 4개 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="이번 달 매출 (통합)" value="₩148,320만" sub="▲ 전월 대비 +12.4%" subColor="text-green-700" />
          <KPI label="미수금 잔액" value="₩23,450만" sub="⚠ 90일 초과 3건 포함" subColor="text-amber-700" />
          <KPI label="쇼핑몰 정산 대기" value="₩8,720만" sub="스마트스토어 4,310 / 쿠팡 4,410" subColor="text-slate-500" />
          <KPI label="부가세 신고까지" value="D-34" sub="준비 항목 3건 미완료" subColor="text-amber-700" />
        </div>

        {/* 2열 테이블 섹션 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* 쇼핑몰 대사 */}
          <Card title="쇼핑몰 — 더존 대사 현황" badge="불일치 2건" badgeColor="bg-amber-50 text-amber-800 border-amber-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 font-normal">채널</th>
                  <th className="text-right py-2 font-normal">쇼핑몰 정산</th>
                  <th className="text-right py-2 font-normal">더존 입력</th>
                  <th className="text-right py-2 font-normal">상태</th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['스마트스토어', '₩4,310만', '₩4,260만']} badge="₩50만 차이" badgeStyle="red" />
                <Tr cells={['쿠팡', '₩4,410만', '₩4,410만']} badge="일치" badgeStyle="green" />
                <Tr cells={['오픈마켓', '₩1,820만', '₩1,750만']} badge="₩70만 차이" badgeStyle="red" />
              </tbody>
            </table>
          </Card>

          {/* 미수금 */}
          <Card title="미수금 현황 (90일+)" badge="요주의 3건" badgeColor="bg-red-50 text-red-800 border-red-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 font-normal">거래처</th>
                  <th className="text-right py-2 font-normal">금액</th>
                  <th className="text-right py-2 font-normal">경과일</th>
                  <th className="text-right py-2 font-normal">상태</th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['(주)한국무역', '₩3,200만', '112일']} badge="긴급" badgeStyle="red" />
                <Tr cells={['대성물산', '₩1,850만', '94일']} badge="주의" badgeStyle="amber" />
                <Tr cells={['삼호유통', '₩980만', '91일']} badge="주의" badgeStyle="amber" />
              </tbody>
            </table>
          </Card>

          {/* 은행 미반영 */}
          <Card title="은행 입금 — 더존 미반영" badge="3건 대기" badgeColor="bg-blue-50 text-blue-800 border-blue-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-100">
                  <th className="text-left py-2 font-normal">일시</th>
                  <th className="text-left py-2 font-normal">입금처</th>
                  <th className="text-right py-2 font-normal">금액</th>
                  <th className="text-right py-2 font-normal">처리</th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['03/27', '오성전자(주)', '₩2,340만']} badge="전표 대기" badgeStyle="blue" />
                <Tr cells={['03/27', '미래산업', '₩870만']} badge="전표 대기" badgeStyle="blue" />
                <Tr cells={['03/26', '한성물류', '₩1,120만']} badge="전표 대기" badgeStyle="blue" />
              </tbody>
            </table>
          </Card>

          {/* 실시간 알림 */}
          <Card title="실시간 알림">
            <div className="space-y-0">
              <Alert color="red" text="스마트스토어 정산금 ₩50만 차이 감지 — 더존 전표와 불일치" time="오늘 09:14" />
              <Alert color="amber" text="부가세 신고 D-34 — 세금계산서 합계 검증 미완료" time="오늘 09:00" />
              <Alert color="amber" text="(주)한국무역 미수금 112일 경과 — 회수 조치 필요" time="어제 17:30" />
              <Alert color="green" text="쿠팡 3월 정산 완료 — ₩4,410만 더존 반영 완료" time="어제 16:45" />
              <Alert color="green" text="국민은행 입출금 내역 동기화 완료 (14건)" time="어제 09:00" />
            </div>
          </Card>
        </div>

        {/* AI 도우미 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-700">AI 도우미</span>
            <span className="text-xs text-slate-400 ml-1">— 현황판 데이터 기반으로 답변합니다</span>
          </div>

          {/* 빠른 질문 버튼 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {CHIPS.map(c => (
              <button
                key={c}
                onClick={() => ask(c)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-40"
              >
                {c}
              </button>
            ))}
          </div>

          {/* 대화 내역 */}
          {messages.length > 0 && (
            <div className="mb-4 space-y-3 max-h-72 overflow-y-auto rounded-lg bg-slate-50 p-4 border border-slate-100">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                  )}
                  <div className={`max-w-[85%] text-sm rounded-xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                  }`}>
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <span className="text-slate-600 text-xs font-bold">나</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1 items-center h-5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay:'0ms'}} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay:'150ms'}} />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay:'300ms'}} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* 입력창 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask(input)}
              placeholder="예) 이번 달 미수금 현황 요약해줘"
              disabled={loading}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 disabled:opacity-50 text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => ask(input)}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
            >
              질문
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-xs text-slate-400 pb-4">
          One Plus 데모 — 가상 데이터 기준 | 실제 운영 시 더존 ERP · 쇼핑몰 · 은행 실데이터 연동 | BSI3Q LLC
        </p>
      </main>
    </div>
  )
}

function KPI({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs text-slate-400 mb-1.5 font-medium">{label}</div>
      <div className="text-2xl font-semibold text-slate-800">{value}</div>
      <div className={`text-xs mt-1.5 ${subColor}`}>{sub}</div>
    </div>
  )
}

function Card({ title, badge, badgeColor, children }: {
  title: string; badge?: string; badgeColor?: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        {badge && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeColor}`}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function Tr({ cells, badge, badgeStyle }: {
  cells: string[]; badge: string; badgeStyle: 'red' | 'amber' | 'green' | 'blue'
}) {
  const styles = {
    red:   'bg-red-50 text-red-800 border-red-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    blue:  'bg-blue-50 text-blue-800 border-blue-200',
  }
  return (
    <tr className="border-b border-slate-50 last:border-0">
      {cells.map((c, i) => (
        <td key={i} className={`py-2 text-sm text-slate-700 ${i > 0 ? 'text-right' : ''}`}>{c}</td>
      ))}
      <td className="py-2 text-right">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles[badgeStyle]}`}>{badge}</span>
      </td>
    </tr>
  )
}

function Alert({ color, text, time }: { color: 'red' | 'amber' | 'green'; text: string; time: string }) {
  const dot = { red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-green-500' }
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot[color]}`} />
      <div>
        <div className="text-xs text-slate-700 leading-relaxed">{text}</div>
        <div className="text-xs text-slate-400 mt-0.5">{time}</div>
      </div>
    </div>
  )
}
