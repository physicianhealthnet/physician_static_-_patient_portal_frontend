import React from 'react'
import { Icon } from '@iconify/react'

export function FeatureSection({
    title,
    features = [],
    buttonText,
    image,
    imagePosition = 'right',
    backgroundColor = 'white',
    subText = null,
    rating = null,
    reviewCount = null
}) {
    const isGray = backgroundColor === 'gray'

    const rowClass = imagePosition === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'

    return (
        <div className={`w-full py-16 md:py-24 ${isGray ? 'bg-[#f8f9fa] border-y border-gray-100' : 'bg-white'}`}>
            <div className={`max-w-6xl mx-auto px-5 w-full flex flex-col items-center gap-12 md:gap-24 ${rowClass}`}>

                <div className='flex-1 flex flex-col items-start'>
                    <h2 className='text-3xl md:text-[34px] font-bold text-[#2d2d32] leading-tight mb-6 max-w-md'>
                        {title}
                    </h2>

                    {features.length > 0 && (
                        <ul className='flex flex-col gap-3 mb-8'>
                            {features.map((feature, idx) => (
                                <li key={idx} className='flex items-start gap-3'>
                                    <Icon icon="mdi:check-circle" className='w-5 h-5 text-[#14bef0] shrink-0 mt-0.5' />
                                    <span className='text-gray-600 font-medium leading-relaxed'>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {buttonText && (
                        <button className='bg-[#14bef0] hover:bg-[#11a9d6] text-white font-semibold py-3 px-6 rounded-sm transition-colors text-sm mb-6'>
                            {buttonText}
                        </button>
                    )}

                    {(rating || reviewCount) && (
                        <div className='flex flex-col gap-1 border-t border-gray-200 pt-4 mt-2'>
                            {rating && (
                                <div className='flex items-center gap-1'>
                                    {[...Array(5)].map((_, i) => (
                                        <Icon key={i} icon="mdi:star" className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-green-500' : 'text-gray-300'}`} />
                                    ))}
                                    <span className='text-xs font-bold ml-1 text-gray-700'>{rating}</span>
                                </div>
                            )}
                            {reviewCount && (
                                <div className='flex flex-col'>
                                    <span className='text-xs text-gray-500 max-w-sm'>{reviewCount}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {subText && (
                        <p className='text-xs text-gray-500 mt-4 max-w-sm leading-relaxed'>
                            {subText}
                        </p>
                    )}
                </div>

                <div className='flex-1 flex justify-center items-center'>
                    {image && (
                        <img
                            src={image}
                            alt={title}
                            className='max-w-full h-auto object-contain max-h-[400px]'
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
