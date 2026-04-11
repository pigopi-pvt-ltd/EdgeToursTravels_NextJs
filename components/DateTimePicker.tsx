'use client';

import React, { useState, useEffect } from 'react';
import { HiCalendarDays, HiClock, HiCheck, HiXMark } from 'react-icons/hi2';

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function DateTimePicker({ value, onChange, error }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState('');
    const [tempTime, setTempTime] = useState('');

    useEffect(() => {
        if (value) {
            const [date, time] = value.split('T');
            setTempDate(date || '');
            setTempTime(time || '');
        }
    }, [value, isOpen]);

    const handleConfirm = () => {
        if (tempDate && tempTime) {
            onChange(`${tempDate}T${tempTime}`);
            setIsOpen(false);
        }
    };

    const displayValue = value ? new Date(value).toLocaleString([], { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    }) : '';

    return (
        <div className="relative group/date">
            <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-between mb-1.5 ${error ? 'text-red-400' : 'text-white/50'}`}>
                <div className="flex items-center gap-2">
                    <HiCalendarDays className={error ? 'text-red-400' : 'text-[#EB664E]'} /> Travel Schedule
                </div>
            </label>

            <div 
                onClick={() => setIsOpen(true)}
                className={`
                    w-full bg-white/5 border rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all 
                    cursor-pointer flex items-center justify-between
                    ${error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/10 hover:border-[#EB664E]/40'}
                    ${!value ? 'text-white/20' : 'text-white'}
                `}
            >
                <div className="flex items-center gap-3">
                    {value ? displayValue : 'Select Date & Time'}
                </div>
                <HiClock className={`text-xl transition-colors ${value ? 'text-[#EB664E]' : 'text-white/20'}`} />
            </div>

            {/* Custom System-Style Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
                    
                    <div className="relative w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-[#0A1128] p-6 text-white text-center">
                            <h3 className="text-lg font-black uppercase tracking-tighter">Choose Schedule</h3>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pickup Date</label>
                                <input 
                                    type="date" 
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0A1128] outline-none focus:border-[#EB664E]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Pickup Time</label>
                                <input 
                                    type="time" 
                                    value={tempTime}
                                    onChange={(e) => setTempTime(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0A1128] outline-none focus:border-[#EB664E]"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    onClick={handleConfirm}
                                    disabled={!tempDate || !tempTime}
                                    className="w-full py-4 bg-[#EB664E] hover:bg-[#d55a45] text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    Confirm (OK) <HiCheck className="text-lg" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full mt-2 py-2 text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="text-[9px] font-bold text-red-400 uppercase tracking-wider mt-1.5">{error}</p>}
        </div>
    );
}
