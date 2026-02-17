"use client"

import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { doctorAgent } from '../../_components/DoctorAgentCard';
import { Circle, Loader, Phone, PhoneCall, PhoneOff } from 'lucide-react';
import Image from 'next/image';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import Provider from '@/app/provider';
import { toast } from 'sonner';

type sessionDetail ={
  id:number,
  notes:string,
  sessionId:string,
  report:JSON,
  selectedDoctor:doctorAgent,
  createdOn:string, 
}
type messages={
  role:string,
  text:string
}

function MedicalVoiceAgent() {
  const {sessionId}= useParams();
  const [sessionDetails, setSessionDetails]=useState<sessionDetail>();
  const [callStarted, setCallStarted]=useState(false);
  const [loading, setLoading]=useState(false);
  const [vapiInstance, setVapiInstance]=useState<Vapi | null>(null);
  const [currentRole, setCurrentRole]=useState<string|null>();
  const [liveTranscript, setLiveTranscript]=useState<string>();
  const [messages,setMessages]=useState<messages[]>([]);
  const router=useRouter();

  useEffect(()=>{
    sessionId&&GetSessionDetails();
  },[sessionId]);

  const GetSessionDetails=async()=>{
    try {
      const result=await axios.get('/api/session-chat?sessionId='+sessionId);
      console.log(result.data);
      setSessionDetails(result.data);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
    }
  }

  const startCall=async()=>{
    try {
      // Check if public key exists
      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
      
      if (!publicKey) {
        toast.error('Vapi public key is missing. Please check your environment variables.');
        console.error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined');
        return;
      }

      console.log('Starting call with public key:', publicKey.substring(0, 10) + '...');

      // Create new Vapi instance
      const vapi = new Vapi(publicKey);
      setVapiInstance(vapi);

      const VapiAgentConfig = {
        name: 'AI Medical Doctor Voice Agent',
        firstMessage: "Hello, I am your AI medical assistant. How can I help you today?",
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        voice: {
          provider: '11labs',
          voiceId: sessionDetails?.selectedDoctor.voiceId || 'burt'
        },
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: sessionDetails?.selectedDoctor.agentPrompt || 'You are a helpful medical assistant.'
            }
          ]
        }
      }

      // Set up event listeners before starting
      vapi.on('call-start', () => {
        console.log('Call started');
        setCallStarted(true);
        toast.success('Call connected!');
      });

      vapi.on('call-end', () => {
        setCallStarted(false);
        console.log('Call ended');
      });

      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        toast.error('Call error: ' + (error.message || 'Unknown error'));
        setCallStarted(false);
      });

      vapi.on('message', (message) => {
        console.log('Vapi message:', message);
        if (message.type === 'transcript') {
          const { role, transcript, transcriptType } = message;
          console.log(`${role}: ${transcript}`);
          
          if (transcriptType === 'partial') {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === 'final') {
            setMessages((prev:any) => [...prev, {role: role, text: transcript}]);
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });

      vapi.on('speech-start', () => {
        console.log('Assistant started speaking');
        setCurrentRole('assistant');
      });

      vapi.on('speech-end', () => {
        console.log('Assistant stopped speaking');
        setCurrentRole('user');
      });

      // Start the call
      //@ts-ignore
      await vapi.start(VapiAgentConfig);
      
    } catch (error: any) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call: ' + (error.message || 'Unknown error'));
      setCallStarted(false);
    }
  }

  const endCall = async () => {
    setLoading(true);
    try {
      if (!vapiInstance) return;
      
      // Stop the call
      vapiInstance.stop();
      
      // Remove listeners
      vapiInstance.removeAllListeners();
      
      // Reset call state
      setCallStarted(false);
      setVapiInstance(null);
      
      // Generate report
      const report = await GenerateReport();
      
      toast.success('Your report is generated!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call properly');
    } finally {
      setLoading(false);
    }
  };

  const GenerateReport = async() => {
  try {
    console.log('Generating report with messages:', messages);
    
    const result = await axios.post('/api/medical-report', {
      messages: messages,
      sessionDetails: sessionDetails,
      sessionId: sessionId
    });
    
    console.log('Report generated:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error('Failed to generate report');
    return null;
  }
}

  return (
    <div className='p-5 border rounded-3xl bg-secondary/10 shadow-lg'>
      <div className='flex justify-between items-center'>
        <h2 className='p-1 px-2 border rounded-md flex gap-2 items-center'>
          <Circle className={`h-4 w-4 rounded-full ${callStarted ? 'bg-green-500' : 'bg-red-500'}`}/>
          {callStarted ? 'Connected' : 'Not connected'}
        </h2>
        <h2 className='font-bold text-xl text-gray-400'>00:00</h2>
      </div>
      
      {sessionDetails && (
        <div className='flex items-center flex-col mt-10'>
          <Image 
            src={sessionDetails?.selectedDoctor.image ?? '/placeholder.png'} 
            alt={sessionDetails?.selectedDoctor?.specialist ?? ''}
            width={120}
            height={120}
            className='h-[100px] w-[100px] object-cover rounded-full'
          />
          <h2 className='mt-2 text-lg'>{sessionDetails?.selectedDoctor?.specialist}</h2>
          <p className='text-sm text-gray-400'>MedVoice Nexus</p>
        
          <div className='mt-12 overflow-y-auto flex flex-col items-center px-10 md:px-28 lg:px-52 xl:px-72'>
            {messages?.slice(-4).map((msg: messages, index) => (
              <h2 className='text-gray-400 p-2' key={index}>
                {msg.role}: {msg.text}
              </h2>
            ))}

            {liveTranscript && liveTranscript?.length > 0 && (
              <h2 className='text-lg'>{currentRole}: {liveTranscript}</h2>
            )}
          </div>

          {!callStarted ? ( 
            <Button
              className="mt-20"
              onClick={startCall}
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : <PhoneCall />}
              Start Call
            </Button>
          ) : ( 
            <Button variant='destructive' onClick={endCall} disabled={loading}>
              {loading ? <Loader className='animate-spin'/> : <PhoneOff/>} 
              Disconnect 
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default MedicalVoiceAgent