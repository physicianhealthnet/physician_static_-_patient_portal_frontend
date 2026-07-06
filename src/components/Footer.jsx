import { Icon } from '@iconify/react'
import React from 'react'

function Footer() {
  return (
    <div className='w-full bg-[#252527] text-white p-5'>
        <div className='max-w-6xl mx-auto w-full'>
            <div className='flex flex-col md:flex-row justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <Icon icon="mdi:logo" className='w-10 h-10' />
                    <h2 className='text-2xl font-semibold'>Physician Health Net</h2>
                </div>
                <div className='flex items-center gap-2'>
                    <Icon icon="mdi:copyright" className='w-5 h-5' />
                    <p className='text-sm'>2026 Physician Health Net. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer