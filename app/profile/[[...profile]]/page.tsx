"use client"
import { UserProfile } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900'>
      {/* Back button */}
      <div className='px-4 py-6 md:px-10'>
        <Button 
          variant="outline" 
          onClick={() => router.push('/dashboard')}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Dashboard
        </Button>
      </div>

      {/* Profile Section */}
      <div className='flex items-center justify-center px-4 pb-10'>
        <div className='w-full max-w-4xl'>
          <h1 className='mb-8 text-center text-4xl font-bold text-slate-800 dark:text-slate-200'>
            My Profile
          </h1>
          
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "shadow-2xl border-2 rounded-3xl bg-white dark:bg-neutral-900",
                navbar: "rounded-t-3xl",
                pageScrollBox: "rounded-b-3xl"
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}