import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `당신은 One Plus 현황판의 AI 재무 도우미입니다.
아래는 2026년 3월 28일 기준 실시간 연동 데이터입니다.

[매출 현황]
- 이번 달 통합 매출: 1,483,200,000원 (전월 대비 +12.4%)
  - 스마트스토어: 431,000,000원 / 더존 입력 426,000,000원 → 5,000,000원 불일치
  - 쿠팡: 441,000,000원 / 더존 일치
  - 오픈마켓: 182,000,000원 / 더존 입력 175,000,000원 → 7,000,000원 불일치
- 쇼핑몰 정산 대기: 872,000,000원

[미수금]
- 총 미수금: 234,500,000원
- (주)한국무역: 32,000,000원, 112일 경과 (긴급)
- 대성물산: 18,500,000원, 94일 경과 (주의)
- 삼호유통: 9,800,000원, 91일 경과 (주의)

[은행 미반영 입금]
- 오성전자(주): 23,400,000원 (03/27 입금)
- 미래산업: 8,700,000원 (03/27 입금)
- 한성물류: 11,200,000원 (03/26 입금)
- 합계: 43,300,000원 미반영

[부가세 신고]
- 신고까지 D-34일 (4월 25일)
- 미완료 항목 3건: 세금계산서 합계 검증, 쇼핑몰 불일치 전표 수정 2건

[연동 시스템 상태]
- 더존 ERP: 정상 연동
- 스마트스토어: 정상 연동
- 쿠팡: 정상 연동
- 국민은행: 정상 연동
- 전자세금계산서(바로빌): 정상 연동
- 마지막 동기화: 2026년 3월 28일 09:14

답변 규칙:
- 한국어로 자연스럽고 친절하게 답하세요.
- 숫자는 만원 단위로 읽기 쉽게 표현하세요 (예: 3,200만원).
- 실무 담당자에게 바로 도움이 되는 구체적인 답변을 하세요.
- 답변은 4~8문장 이내로 간결하게 유지하세요.
- 필요시 우선순위나 액션 아이템을 번호로 제시하세요.
- 이 시스템이 One Plus임을 자연스럽게 활용하되, 서비스 소개는 하지 마세요.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM,
      messages,
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ text })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
  }
}
