"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRightIcon, Loader2 } from 'lucide-react'
import axios from 'axios'
import DoctorAgentCard, { doctorAgent } from './DoctorAgentCard'
import SuggestedDoctorCard from './SuggestedDoctorCard'
import { useRouter } from 'next/navigation'
function AddNewSessionDialog() {
 const [note, setNote] = useState("");
const [loading, setLoading] = useState(false);
const [suggestedDoctors, setSuggestedDoctors] = useState<doctorAgent[]>([]);
const [selectedDoctor, setSelectedDoctor] = useState<doctorAgent>();
// console.log(result.data);
//   setSuggestedDoctors(result.data);
// setLoading(false);
// }
const router = useRouter();
const OnClickNext = async () => {
  setLoading(true);

  const result = await axios.post('/api/suggest-doctors', {
    notes: note,
  });

  console.log("API RESPONSE:", result.data);

  setSuggestedDoctors(
    Array.isArray(result.data) ? result.data : []
  );

  setLoading(false);
};
   const onStartConsultation=async()=>{
   setLoading(true);
  //save all info to data base and start new consultation session
  const result= await axios.post('/api/session-chat',{
    notes:note,
    selectedDoctor:selectedDoctor,
  });
   console.log(result.data);
   if (result.data?.sessionId){
    console.log(result.data.sessionId);
    //Route to Conversation Page Screen
    router.push('/dashboard/medical-agent/'+result.data.sessionId);
  }
    setLoading(false);
}
  return (
 <Dialog>
    <DialogTrigger asChild>
 <Button className='mt-3'>+ Start a Consultation</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Basic Details </DialogTitle>
      <DialogDescription asChild>
  {suggestedDoctors.length === 0 ? (
    <div>
      <h2>Add symptoms or any other details</h2>
      <Textarea
        placeholder="Type here..."
        className="h-[200px] mt-1"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  ) : (
    <div>
      <h2 >Select a Doctor</h2>
    <div className="grid grid-cols-3 gap-5">
      {suggestedDoctors.map((doctor, index) => (
        <SuggestedDoctorCard
          key={doctor.id ?? index}
          doctorAgent={doctor}
          setSelectedDoctor={()=>setSelectedDoctor(doctor)}
          //@ts-ignore
           selectedDoctor={selectedDoctor}/>
      ))}
    </div>
    </div>
  )}
</DialogDescription>
    </DialogHeader>
     <DialogFooter>
        <DialogClose asChild>
        <Button variant={'outline'}>Cancel</Button>
        </DialogClose>
        {/* {!suggestedDoctors?<Button disabled={!note || loading} onClick={() =>OnClickNext()}>
         
          Next {loading ?<Loader2 className='animate-spin' />:<ArrowRightIcon />}</Button>
          :<Button>Start Consultation</Button>} */}
          {suggestedDoctors.length === 0 ? (
  <Button
    disabled={!note || loading}
    onClick={OnClickNext}
  >
    Next {loading ? <Loader2 className="animate-spin" /> : <ArrowRightIcon />}
  </Button>
) : (
  <Button disabled={loading || !selectedDoctor} onClick={()=>onStartConsultation()}>Start Consultation
  {loading ? <Loader2 className="animate-spin" /> : <ArrowRightIcon />}</Button>
)}
     </DialogFooter>
  </DialogContent>
</Dialog>
  )
}

export default AddNewSessionDialog
