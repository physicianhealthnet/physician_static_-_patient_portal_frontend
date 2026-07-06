import React from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

export default function AboutUs() {
    const navigate = useNavigate();
    return (
        <div className='w-full min-h-screen bg-[#f8f9fa] pt-12 pb-20 px-5'>
            <div className='max-w-4xl mx-auto'>
                <button 
                   onClick={() => navigate(-1)} 
                   className="flex items-center text-sm font-medium text-gray-500 hover:text-[#14bef0] transition-colors mb-4"
                >
                   <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
                   Back
                </button>
                <div className='text-center mb-16'>
                    <h1 className='text-4xl md:text-5xl font-bold text-[#1c2c84] mb-6'>About PHN</h1>
                    <p className='text-gray-600 text-lg md:text-xl max-w-2xl mx-auto'>
                        Bridging the gap between patients and quality healthcare providers through innovative digital solutions.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-10 mb-16'>
                    <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                        <div className='w-14 h-14 bg-[#14bef0]/10 rounded-xl flex items-center justify-center mb-6'>
                            <Icon icon="mdi:target" className='text-[#14bef0] w-8 h-8' />
                        </div>
                        <h2 className='text-2xl font-bold text-[#1c2c84] mb-4'>Our Mission</h2>
                        <p className='text-gray-600 leading-relaxed'>
                            To empower individuals to take control of their health by providing accessible, reliable, and secure healthcare solutions. We strive to make finding the right doctors, booking appointments, and managing medical records a seamless experience.
                        </p>
                    </div>

                    <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
                        <div className='w-14 h-14 bg-[#14bef0]/10 rounded-xl flex items-center justify-center mb-6'>
                            <Icon icon="mdi:eye-outline" className='text-[#14bef0] w-8 h-8' />
                        </div>
                        <h2 className='text-2xl font-bold text-[#1c2c84] mb-4'>Our Vision</h2>
                        <p className='text-gray-600 leading-relaxed'>
                            To revolutionize healthcare access by creating a comprehensive digital ecosystem that prioritizes patient care, robust data security, and seamless, transparent communication between medical professionals and individuals everywhere.
                        </p>
                    </div>
                </div>

                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-6'>Why Choose Us?</h2>
                    <p className='text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed lg:text-lg'>
                        Physician Health Net (PHN) is built on the principles of integrity, innovation, and empathy. We believe in providing high-quality, compassionate technology solutions that put our users first.
                    </p>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
                        <div className='flex flex-col items-center group'>
                            <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                                <Icon icon="mdi:shield-check" className='text-[#1c2c84] w-10 h-10' />
                            </div>
                            <h3 className='font-bold text-gray-800 mb-2'>Secure Platform</h3>
                            <p className='text-sm text-gray-500'>Your health data is protected with industry-leading encryption and security protocols.</p>
                        </div>
                        <div className='flex flex-col items-center group'>
                            <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                                <Icon icon="mdi:account-group" className='text-[#1c2c84] w-10 h-10' />
                            </div>
                            <h3 className='font-bold text-gray-800 mb-2'>Trusted Doctors</h3>
                            <p className='text-sm text-gray-500'>Connect with verified, top-rated medical professionals in your area.</p>
                        </div>
                        <div className='flex flex-col items-center group'>
                            <div className='w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform'>
                                <Icon icon="mdi:clock-fast" className='text-[#1c2c84] w-10 h-10' />
                            </div>
                            <h3 className='font-bold text-gray-800 mb-2'>24/7 Access</h3>
                            <p className='text-sm text-gray-500'>Access your medical records and book appointments anytime, anywhere.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
