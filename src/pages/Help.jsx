import React from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function Help() {
    const navigate = useNavigate();
    return (
        <div className='w-full min-h-screen bg-[#f8f9fa] pt-8 pb-20 px-5'>
            <SEO 
                title="Help Center | Physician Health Net"
                description="Need help with Physician Health Net? Visit our Help Center for FAQs, technical support, and guides for patients and doctors."
                keywords="help center, technical support, FAQs, physician health net"
                url="/help"
            />
            <div className='max-w-4xl mx-auto'>
                <button 
                   onClick={() => navigate(-1)} 
                   className="flex items-center text-sm font-medium text-gray-500 hover:text-[#14bef0] transition-colors mb-4"
                >
                   <Icon icon="mdi:arrow-left" className="w-5 h-5 mr-1" />
                   Back
                </button>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold text-[#1c2c84] mb-4'>Help Center</h1>
                    <p className='text-gray-600 text-lg'>We are here to support you.</p>
                </div>

                {/* Help Section */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                    <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-100'>
                        <Icon icon="mdi:help-circle-outline" className='text-[#14bef0] w-8 h-8' />
                        <h2 className='text-2xl font-bold text-gray-800'>Help & Support</h2>
                    </div>

                    <p className='text-gray-600 mb-8 leading-relaxed'>
                        We are here to assist you in using the PHN Web Application smoothly and efficiently.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                        {/* For Doctors */}
                        <div className='bg-[#f8f9fa] p-5 rounded-lg border border-gray-100'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Icon icon="mdi:stethoscope" className='text-[#1c2c84] w-6 h-6' />
                                <h3 className='font-bold text-lg text-[#1c2c84]'>For Doctors</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Manage appointments and consultation schedules.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Access patient medical history securely.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Conduct video consultations with integrated secure streaming.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Upload prescriptions and reports digitally.</li>
                            </ul>
                        </div>

                        {/* For Patients */}
                        <div className='bg-[#f8f9fa] p-5 rounded-lg border border-gray-100'>
                            <div className='flex items-center gap-2 mb-4'>
                                <Icon icon="mdi:account-group" className='text-[#1c2c84] w-6 h-6' />
                                <h3 className='font-bold text-lg text-[#1c2c84]'>For Patients</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Easy registration and profile management.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Book appointments with preferred doctors.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> Join secure video consultations.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:chevron-right" className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' /> View prescriptions and medical reports anytime.</li>
                            </ul>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Technical Support */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:tools" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>Technical Support</h3>
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>If you experience any issues:</p>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:information-outline" className='w-4 h-4 text-[#14bef0] mt-0.5 shrink-0' /> Use the Help Center section inside the dashboard.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:email-outline" className='w-4 h-4 text-[#14bef0] mt-0.5 shrink-0' /> Contact support via email: <a href="mailto:support@phnhealth.com" className='text-[#14bef0] hover:underline'>support@phnhealth.com</a></li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:message-text-outline" className='w-4 h-4 text-[#14bef0] mt-0.5 shrink-0' /> Live chat support available during working hours.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:phone-outline" className='w-4 h-4 text-[#14bef0] mt-0.5 shrink-0' /> Emergency assistance hotline available 24/7.</li>
                            </ul>
                        </div>

                        {/* FAQs */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:frequently-asked-questions" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>FAQs</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2 cursor-pointer hover:text-[#14bef0] transition-colors'><Icon icon="mdi:help-circle" className='w-4 h-4 mt-0.5 shrink-0' /> How to book an appointment?</li>
                                <li className='flex items-start gap-2 cursor-pointer hover:text-[#14bef0] transition-colors'><Icon icon="mdi:help-circle" className='w-4 h-4 mt-0.5 shrink-0' /> How to reset my password?</li>
                                <li className='flex items-start gap-2 cursor-pointer hover:text-[#14bef0] transition-colors'><Icon icon="mdi:help-circle" className='w-4 h-4 mt-0.5 shrink-0' /> How to join a video consultation?</li>
                                <li className='flex items-start gap-2 cursor-pointer hover:text-[#14bef0] transition-colors'><Icon icon="mdi:help-circle" className='w-4 h-4 mt-0.5 shrink-0' /> How to download prescriptions?</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
