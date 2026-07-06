import React from 'react'
import { Icon } from '@iconify/react'
import heroBg from '../assets/hero_bg.png'
import { DualSearchInput } from './DualSearchInput'

export function HeroSearch() {

    return (
        <div className='relative w-full bg-[#1c2c84]' style={{ minHeight: '450px' }}>
            <div
                className='absolute inset-0 w-full h-full bg-bottom bg-no-repeat bg-contain opacity-90'
                style={{ backgroundImage: `url(${heroBg})` }}
            ></div>

            <div className='relative z-10 max-w-6xl mx-auto flex flex-col items-center pt-16 pb-32 px-5'>
                <h1 className='text-white text-4xl md:text-5xl font-bold mb-4 font-sans'>
                    Your home for health
                </h1>
                <h2 className='text-white text-xl md:text-2xl font-semibold mb-8 font-sans'>
                    Find and Book
                </h2>

                <DualSearchInput />

                <div className='flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-gray-300'>
                    <span>Popular searches:</span>
                    <a href="#" className='hover:text-white transition-colors'>Dermatologist</a>
                    <a href="#" className='hover:text-white transition-colors'>Pediatrician</a>
                    <a href="#" className='hover:text-white transition-colors'>Gynecologist/Obstetrician</a>
                    <a href="#" className='hover:text-white transition-colors flex items-center'>
                        Others <Icon icon="mdi:chevron-down" className='ml-1' />
                    </a>
                </div>
            </div>

            <div className='absolute bottom-0 left-0 w-full bg-[#16226a] bg-opacity-95 shadow-lg border-t border-[#253696]'>
                <div className='max-w-6xl mx-auto flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group'>
                        <Icon icon="mdi:stethoscope" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>Consult with a doctor</span>
                    </a>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group'>
                        <Icon icon="mdi:pill" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>Order Medicines</span>
                    </a>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group'>
                        <Icon icon="mdi:file-document-outline" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>View medical records</span>
                    </a>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group relative'>
                        <div className='absolute top-2 right-8 bg-green-500 text-white text-[10px] font-bold px-1.5 rounded-sm'>New</div>
                        <Icon icon="mdi:flask-outline" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>Book test</span>
                    </a>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group'>
                        <Icon icon="mdi:book-open-page-variant-outline" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>Read articles</span>
                    </a>

                    <a href="#" className='flex-1 min-w-[150px] flex flex-col items-center justify-center p-4 hover:bg-[#1a2982] transition-colors border-r border-[#253696] last:border-0 group'>
                        <Icon icon="mdi:briefcase-outline" className='w-8 h-8 text-gray-300 group-hover:text-white mb-2 transition-colors' />
                        <span className='text-xs text-center text-gray-300 group-hover:text-white font-medium'>For healthcare providers</span>
                    </a>

                </div>
            </div>
        </div>
    )
}
