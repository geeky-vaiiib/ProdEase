import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { ManufacturingProvider } from "@/contexts/manufacturing-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { DataProvider } from "@/contexts/data-context"
import ErrorBoundary from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "ProdEase - Manufacturing Management System",
  description: "Digital manufacturing workflow management and production tracking",
  generator: "ProdEase",
  manifest: "/manifest.json",
  icons: {
    icon: "/prodease-logo.svg",
    shortcut: "/prodease-logo.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <DataProvider>
                <ManufacturingProvider>
                  <Suspense fallback={null}>{children}</Suspense>
                </ManufacturingProvider>
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
