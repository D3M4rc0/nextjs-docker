import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js Docker Benchmark',
  description: 'Benchmark app for testing Docker build performance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

