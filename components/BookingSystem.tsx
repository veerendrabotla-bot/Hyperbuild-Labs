import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from './Button';
import Input from './ui/Input';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_AUTO_REPLY_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../constants';

const BookingSystem: React.FC = () => {
  const { success, error: showError, show } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Date/Time, 2: Info, 3: Success
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });

  const [availableDays, setAvailableDays] = useState<Date[]>([]);

  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  // Generate next 14 days
  useEffect(() => {
    const days: Date[] = [];
    const today = new Date();
    // Start from tomorrow
    today.setDate(today.getDate() + 1);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days.push(date);
      }
    }
    setAvailableDays(days);
    setSelectedDate(days[0]);
  }, []);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookedSlots = async (date: Date) => {
    setLoading(true);
    // Create range for the selected day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('date')
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      
      const slots = (data || []).map((appt: any) => {
        const d = new Date(appt.date);
        return `${d.getHours()}:00`;
      });
      setBookedSlots(slots);
    } catch (err: any) {
      // If table doesn't exist, we just log a warning and proceed with empty slots (Demo Mode)
      console.warn("Booking System Warning: Could not fetch slots (using demo mode).", err.message);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !formData.name || !formData.email) return;

    setLoading(true);
    
    // Construct ISO date string
    const [hours] = selectedSlot.split(':');
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(parseInt(hours), 0, 0, 0);
    const formattedDate = `${selectedDate.toLocaleDateString()} at ${selectedSlot}`;

    try {
      // 1. Save to Database
      const { error } = await supabase.from('appointments').insert([
        {
          name: formData.name,
          email: formData.email,
          notes: formData.notes,
          date: appointmentDate.toISOString(),
          status: 'confirmed'
        }
      ]);

      if (error) throw error;

      // 2. Send Emails (Non-blocking for user success but logged)
      if (EMAILJS_SERVICE_ID !== 'service_placeholder') {
        try {
          // Admin Alert
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_name: 'Admin',
            from_name: formData.name,
            from_email: formData.email,
            message: `New Booking: ${formattedDate}. Notes: ${formData.notes}`,
            service: 'Discovery Call Booking'
          });

          // User Confirmation
          if (EMAILJS_AUTO_REPLY_TEMPLATE_ID) {
             await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTO_REPLY_TEMPLATE_ID, {
                to_name: formData.name,
                to_email: formData.email,
                service: `Discovery Call on ${formattedDate}`,
                message: `Thank you for booking. We have scheduled your call for ${formattedDate}. Link will be sent shortly.`
             });
          }
        } catch (emailError) {
          console.error("Failed to send booking emails:", emailError);
          // Don't fail the UI, just log it
        }
      }
      
      success("Booking confirmed successfully!");
      setStep(3); // Success
    } catch (err: any) {
      console.error("Booking error:", err);
      
      // Fallback for demo purposes if DB is missing
      if (err.message?.includes("Could not find the table") || err.code === "PGRST205") {
         show("Demo Mode: Booking simulated (Database table missing)", "info");
         setStep(3);
      } else {
         showError(`Failed to book: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
      <div className="bg-secondary-900 p-6 text-white">
        <h3 className="text-xl font-bold flex items-center">
          <Calendar className="mr-3 text-brand-400" />
          Book a Discovery Call
        </h3>
        <p className="text-slate-400 text-sm mt-1">15 Minute Intro Session</p>
      </div>

      <div className="flex-1 p-6 md:p-8">
        {step === 1 && (
          <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Date Selection */}
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 mb-4">Select a Date</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {availableDays.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    className={`p-3 rounded-lg border text-sm text-center transition-all ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
              <h4 className="font-bold text-slate-900 mb-4">Select a Time</h4>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-600" /></div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot, idx) => {
                    const isBooked = bookedSlots.includes(slot);
                    return (
                      <button
                        key={idx}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                          selectedSlot === slot
                            ? 'bg-brand-600 text-white border-brand-600'
                            : isBooked
                            ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed decoration-slate-400 line-through decoration-2'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-brand-400 text-center'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-8 flex justify-end">
                <Button 
                  disabled={!selectedDate || !selectedSlot} 
                  onClick={() => setStep(2)}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-md mx-auto animate-fadeIn">
            <button 
              onClick={() => setStep(1)} 
              className="mb-6 text-sm text-slate-500 hover:text-brand-600 flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" /> Back to calendar
            </button>

            <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl mb-6 flex items-start">
               <Clock className="text-brand-600 w-5 h-5 mr-3 mt-0.5" />
               <div>
                 <p className="font-bold text-brand-900">
                   {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                 </p>
                 <p className="text-brand-700 text-sm">
                   at {selectedSlot} (Agency Time)
                 </p>
               </div>
            </div>

            <div className="space-y-4">
              <Input 
                label="Full Name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Input 
                label="Email Address"
                placeholder="jane@company.com"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Additional Notes (Optional)</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <Button 
                onClick={handleBooking} 
                className="w-full" 
                isLoading={loading}
                disabled={!formData.name || !formData.email}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 mb-8 max-w-xs mx-auto">
              We have scheduled your call for <strong>{selectedDate?.toLocaleDateString()} at {selectedSlot}</strong>. A confirmation email has been sent to {formData.email}.
            </p>
            <Button onClick={() => {
              setStep(1);
              setSelectedSlot(null);
              setFormData({ name: '', email: '', notes: '' });
            }} variant="outline">
              Book Another Call
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSystem;