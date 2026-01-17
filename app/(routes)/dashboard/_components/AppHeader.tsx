import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react'


const menuOptions = [
  {
    id: 1,
    name: 'Home',
    path:'/dashboard'
  },

  {
    id: 2,
    name: 'History',
    path:'/dashboard/history'
  },
  {
    id: 3,
    name: 'Pricing',
    path:'/dashboard/billing'
  },
  {
    id: 4,
    name: 'Profile',
    path:'/profile'
  },
]
 function AppHeader() {
  return (
    <div className='flex items-center justify-between p-4 shadow-md px-10 md:px-20 lg:px-40'>
      {/* <img src={"/logo.svg"} alt="Logo" width={170} height={90}/> */}
    <div className="flex items-center h-13 overflow-hidden"> {/* Keeps header height fixed at 48px */}
  <img 
    src="/logo.svg" 
    alt="MedVoice AI" 
    className="h-68 w-auto object-contain -ml-18 -my-10" 
    style={{ minWidth: '200px' }} 
  />
</div>   
      <div className='hidden md:flex gap-12 items-center'>
        {menuOptions.map((option,index) => (
          <Link key={index} href={option.path}>
            <h2 className='hover:font-bold cursor-pointer transition-all'>{option.name}</h2>
          </Link>
        ))}
      </div>
      <UserButton />
    </div>
  )
}
export default AppHeader;