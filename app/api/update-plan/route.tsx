import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await req.json()

    // Update user metadata in Clerk
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: plan
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Plan updated successfully' 
    })
    
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ 
      error: 'Failed to update plan' 
    }, { status: 500 })
  }
}