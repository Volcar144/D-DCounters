import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Encounters - Combat Tracker',
  description: 'A comprehensive D&D 5e combat encounter tracker with real-time multiplayer support',
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
