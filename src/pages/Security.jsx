import React from 'react'
import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

export default function Security() {
    const navigate = useNavigate();
    return (
        <div className='w-full min-h-screen bg-[#f8f9fa] pt-8 pb-20 px-5'>
            <SEO 
                title="Security Policies | Physician Health Net"
                description="Learn about our robust security policies. At Physician Health Net, we prioritize the safety and privacy of patient data."
                keywords="healthcare data security, patient privacy, secure medical records"
                url="/security"
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
                    <h1 className='text-4xl font-bold text-[#1c2c84] mb-4'>Security</h1>
                    <p className='text-gray-600 text-lg'>Your safety is our top priority.</p>
                </div>

                {/* Security Section */}
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
                    <div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-100'>
                        <Icon icon="mdi:shield-lock-outline" className='text-[#14bef0] w-8 h-8' />
                        <h2 className='text-2xl font-bold text-gray-800'>Security Policies</h2>
                    </div>

                    <p className='text-gray-600 mb-8 leading-relaxed'>
                        At PHN Web Application, we prioritize the safety and privacy of patient data. Our platform is built with modern security standards to ensure confidential and secure healthcare communication.
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Data Protection */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:shield-check" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>Data Protection</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> All patient and doctor data is encrypted using SSL/TLS encryption.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Sensitive information is stored securely in encrypted databases.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Regular security audits and updates are performed to prevent vulnerabilities.</li>
                            </ul>
                        </div>

                        {/* Secure Authentication */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:account-lock" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>Secure Authentication</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Role-based access control (Admin / Doctor / Patient).</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Strong password policies.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Secure login sessions with token-based authentication (JWT).</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Automatic session timeout for inactive users.</li>
                            </ul>
                        </div>

                        {/* Privacy & Confidentiality */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:eye-off" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>Privacy & Confidentiality</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> We comply with healthcare data privacy standards.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Patient medical records are accessible only to authorized personnel.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Video consultations are securely transmitted and not stored without consent.</li>
                            </ul>
                        </div>

                        {/* System Monitoring */}
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <Icon icon="mdi:monitor-dashboard" className='text-[#14bef0] w-5 h-5' />
                                <h3 className='font-semibold text-lg text-gray-800'>System Monitoring</h3>
                            </div>
                            <ul className='space-y-2 text-gray-600 text-sm'>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Continuous server monitoring for suspicious activities.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Protection against SQL Injection, XSS, and CSRF.</li>
                                <li className='flex items-start gap-2'><Icon icon="mdi:check-circle" className='w-4 h-4 text-green-500 mt-0.5 shrink-0' /> Regular backups to prevent data loss.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
