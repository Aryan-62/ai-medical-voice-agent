'use client'
import { PricingTable } from '@clerk/nextjs'
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function Billing() {
  const { user } = useUser()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)
  const [showActivateButton, setShowActivateButton] = useState(false)

  // REMOVED THE AUTO-REDIRECT FOR PRO USERS
  // Now pro users can also view the pricing page

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.publicMetadata?.plan !== 'pro') {
        setShowActivateButton(true)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [user])

  const handleActivate = async () => {
    setIsChecking(true)
    
    try {
      const response = await fetch('/api/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          plan: 'pro' 
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update plan')
      }

      await new Promise(resolve => setTimeout(resolve, 2000))

      alert('🎉 Premium activated successfully!')
      window.location.href = '/dashboard'
      
    } catch (error) {
      console.error('Error activating premium:', error)
      setIsChecking(false)
      alert('❌ Error activating premium. Please try again or contact support.')
    }
  }

  // Show message for pro users instead of pricing table
  if (user?.publicMetadata?.plan === 'pro') {
    return (
      <div className='px-10 md:px-24 lg:px-48'>
        <h2 className='font-bold text-3xl mb-10'>Subscription Status</h2>
        
        <div className='p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg dark:from-green-950 dark:to-emerald-950 dark:border-green-700'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='text-3xl'>✅</span>
            <h3 className='text-2xl font-bold text-green-800 dark:text-green-200'>
              You're on Premium!
            </h3>
          </div>
          <p className='text-lg text-green-700 dark:text-green-300 mb-6'>
            You have full access to all premium doctors and unlimited consultations.
          </p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className='bg-green-600 hover:bg-green-700 text-white font-semibold'
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='px-10 md:px-24 lg:px-48'>
        <h2 className='font-bold text-3xl mb-10'>Join Subscription</h2>
        
        {showActivateButton && (
          <div className='mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg dark:from-green-950 dark:to-emerald-950 dark:border-green-700'>
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-2xl'>🎉</span>
              <h3 className='text-lg font-bold text-green-800 dark:text-green-200'>
                Just Subscribed?
              </h3>
            </div>
            <p className='text-sm text-green-700 dark:text-green-300 mb-4'>
              Click below to activate your premium access instantly!
            </p>
            <Button 
              onClick={handleActivate} 
              disabled={isChecking}
              className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold'
              size="lg"
            >
              {isChecking ? (
                <span className='flex items-center gap-2'>
                  <span className='animate-spin'>⏳</span> Activating Premium...
                </span>
              ) : (
                '✨ Activate Premium Access Now'
              )}
            </Button>
          </div>
        )}
        
        <PricingTable/>
      </div>
    </div>
  )
}

export default Billing