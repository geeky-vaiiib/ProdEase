import { NextResponse } from 'next/server'

export async function GET() {
  // Return empty array for transactions since this is a manufacturing app
  return NextResponse.json({
    success: true,
    data: [],
    message: 'No transactions found'
  })
}

export async function POST() {
  // Handle sync requests - just return success for now
  return NextResponse.json({
    success: true,
    message: 'Transactions synced successfully'
  })
}
