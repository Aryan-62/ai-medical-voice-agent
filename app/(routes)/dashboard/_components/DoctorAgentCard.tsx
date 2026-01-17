"use client"
import { useRouter } from "next/navigation"
import { useUser } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconArrowRight } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'

export type doctorAgent={
    id:number,
    specialist:string,
    description:string,
    image?:string,
    agentPrompt:string,
    voiceId?:string,
    subscriptionRequired:boolean
}
type props={
    doctorAgent:doctorAgent
}
function DoctorAgentCard({ doctorAgent }: props) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [consultationCount, setConsultationCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const isPaidUser = user?.publicMetadata?.plan === "pro"
  const canAccess = isPaidUser || !doctorAgent.subscriptionRequired
  const imageSrc = doctorAgent.image || "/doctor-placeholder.png"

  // Fetch consultation count for free users
  useEffect(() => {
    const fetchConsultationCount = async () => {
      if (!isPaidUser && isLoaded) {
        try {
          const response = await fetch('/api/session-chat?sessionId=all')
          if (response.ok) {
            const data = await response.json()
            setConsultationCount(data.length || 0)
          }
        } catch (error) {
          console.error('Error fetching consultations:', error)
        }
      }
    }
    fetchConsultationCount()
  }, [isPaidUser, isLoaded])

  const handleConsultation = async () => {
    // Premium doctor check
    if (doctorAgent.subscriptionRequired && !isPaidUser) {
      router.push("/dashboard/billing")
      return
    }

    // Free user limit check
    if (!isPaidUser && consultationCount >= 1) {
      alert("You've used your free consultation. Please upgrade to continue!")
      router.push("/dashboard/billing")
      return
    }

    // Create session
    setLoading(true)
    try {
      const response = await fetch('/api/session-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: '',
          selectedDoctor: doctorAgent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to start consultation")
        if (data.limitReached) {
          router.push("/dashboard/billing")
        }
        setLoading(false)
        return
      }

      // Navigate to consultation page
      router.push(`/dashboard/medical-agent/${data.sessionId}`)
    } catch (error) {
      console.error("Consultation error:", error)
      alert("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Premium badge */}
      {doctorAgent.subscriptionRequired && (
        <Badge className="absolute m-2 right-0 z-10">
          Premium
        </Badge>
      )}

      {/* Free consultation counter */}
      {!isPaidUser && !doctorAgent.subscriptionRequired && (
        <Badge className="absolute m-2 left-0 z-10 bg-green-500">
          {consultationCount >= 1 ? "0/1 Free" : "1/1 Free"}
        </Badge>
      )}

      <div className="flex flex-col h-full">
        <img
          src={imageSrc}
          alt={doctorAgent.specialist}
          width={200}
          height={300}
          className="w-full h-[250px] object-cover rounded-xl"
        />

        <h2 className="font-bold mt-1">
          {doctorAgent.specialist}
        </h2>

        <p className="line-clamp-2 text-sm text-gray-600 flex-grow min-h-[40px]">
          {doctorAgent.description}
        </p>

        <Button
          className="w-full mt-2"
          variant={!canAccess ? "secondary" : "default"}
          onClick={handleConsultation}
          disabled={loading}
        >
          {loading ? "Loading..." : !canAccess ? "Upgrade to Access" : "Start Consultation"} 
          <IconArrowRight />
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard