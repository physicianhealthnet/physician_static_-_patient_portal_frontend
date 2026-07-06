import React from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

export default function ContactUs() {
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
                    <h1 className='text-4xl md:text-5xl font-bold text-[#1c2c84] mb-6'>Contact Us</h1>
                    <p className='text-gray-600 text-lg md:text-xl max-w-2xl mx-auto'>
                        Have a question or need assistance? Our support team is here to help you.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                    {/* Contact Information */}
                    <div className='bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 h-full'>
                        <h2 className='text-2xl font-bold text-gray-800 mb-8'>Get In Touch</h2>
                        
                        <div className='space-y-8'>
                            <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                                    <Icon icon="mdi:map-marker" className='text-[#14bef0] w-6 h-6' />
                                </div>
                                <div>
                                    <h3 className='font-bold text-gray-800 text-lg mb-1'>Location</h3>
                                    <p className='text-gray-500 text-sm leading-relaxed'>
                                        2nd Floor, GRAND BRENTON, Avinashi Road, Peelamedu,<br/>
                                        Coimbatore, Tamil Nadu - 641004
                                    </p>
                                </div>
                            </div>
                            
                            <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                                    <Icon icon="mdi:phone" className='text-[#14bef0] w-6 h-6' />
                                </div>
                                <div>
                                    <h3 className='font-bold text-gray-800 text-lg mb-1'>Phone Support</h3>
                                    <p className='text-gray-500 text-sm'>+91 96291 57571</p>
                                    <p className='text-gray-500 text-sm'>Mon-Sat from 9am to 6pm</p>
                                </div>
                            </div>

                            <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0'>
                                    <Icon icon="mdi:email" className='text-[#14bef0] w-6 h-6' />
                                </div>
                                <div>
                                    <h3 className='font-bold text-gray-800 text-lg mb-1'>Email Support</h3>
                                    <p className='text-[#14bef0] text-sm hover:underline cursor-pointer'>physicianhealthnet@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className='bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center h-full'>
                        <h2 className='text-xl font-bold text-gray-800 mb-6'>Send us a Message</h2>
                        <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                                <input type='text' required placeholder='John Doe' className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14bef0] focus:border-transparent transition-all' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Email Address</label>
                                <input type='email' required placeholder='john@example.com' className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14bef0] focus:border-transparent transition-all' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
                                <textarea required rows="4" placeholder='How can we help you?' className='w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14bef0] focus:border-transparent transition-all resize-none'></textarea>
                            </div>
                            <button type="submit" className='mt-2 w-full bg-[#1c2c84] hover:bg-[#152266] text-white font-bold py-3 rounded-lg shadow-sm transition-colors'>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}
