import { NextResponse } from 'next/server'

export async function GET() {
  // Return empty array for notifications since this is a manufacturing app
  return NextResponse.json({
    success: true,
    data: [],
    message: 'No notifications found'
  })
}

export async function POST() {
  // Handle sync requests - just return success for now
  return NextResponse.json({
    success: true,
    message: 'Notifications synced successfully'
  })
}
