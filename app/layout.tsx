import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'One Plus — 더존 ERP 연동 자동화',
  description: '더존 위에 One Plus를 얹어드립니다. 쇼핑몰·은행·물류 데이터를 자동 연동하고 AI로 재무 현황을 분석합니다.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen">{children}</body>
    </html>
  )
}
