import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Appointment } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import { Calendar, Clock, Loader2, XCircle, Mail, User } from 'lucide-react';

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true }); // Show soonest first
      
      if (error) throw error;
      setAppointments(data as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, status: 'cancelled' } : apt
      ));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  return (
    <div>
       <div className="mb-6 flex items-center justify-between">
         <h2 className="text-lg font-semibold text-slate-700">Upcoming Schedule</h2>
         <Button variant="outline" size="sm" onClick={fetchAppointments}>Refresh</Button>
       </div>

       {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" /></div>
       ) : appointments.length === 0 ? (
          <Card className="text-center py-16 text-slate-400">
             <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
             <p>No appointments booked yet.</p>
          </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {appointments.map(apt => {
             const date = new Date(apt.date);
             const isPast = date < new Date();
             
             return (
               <Card key={apt.id} className={`border-l-4 ${
                 apt.status === 'cancelled' ? 'border-l-slate-300 opacity-75' : 
                 isPast ? 'border-l-slate-400 bg-slate-50' : 
                 'border-l-brand-500'
               }`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[60px]">
                        <div className="text-xs font-bold text-slate-500 uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-xl font-bold text-slate-900">{date.getDate()}</div>
                     </div>
                     <Badge variant={apt.status === 'cancelled' ? 'neutral' : isPast ? 'neutral' : 'success'}>
                        {apt.status === 'cancelled' ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                     </Badge>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center text-slate-700 font-semibold">
                        <Clock size={16} className="mr-2 text-brand-500" />
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="flex items-center text-slate-600 text-sm">
                        <User size={16} className="mr-2 text-slate-400" />
                        {apt.name}
                     </div>
                     <div className="flex items-center text-slate-600 text-sm">
                        <Mail size={16} className="mr-2 text-slate-400" />
                        <a href={`mailto:${apt.email}`} className="hover:text-brand-600 hover:underline">{apt.email}</a>
                     </div>
                     {apt.notes && (
                       <div className="bg-slate-50 p-2 rounded text-xs text-slate-500 mt-2 border border-slate-100 italic">
                         "{apt.notes}"
                       </div>
                     )}
                  </div>

                  {apt.status !== 'cancelled' && !isPast && (
                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => cancelAppointment(apt.id)}
                        className="text-red-500 text-sm hover:text-red-700 flex items-center"
                      >
                        <XCircle size={14} className="mr-1" /> Cancel Booking
                      </button>
                    </div>
                  )}
               </Card>
             );
           })}
         </div>
       )}
    </div>
  );
};

export default AdminAppointments;