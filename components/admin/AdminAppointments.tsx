import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Appointment } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import { Calendar, Clock, Loader2, XCircle, Mail, User, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminAppointments: React.FC = () => {
  const { success, error: showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Track ID of appointment being modified

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

  const updateStatus = async (id: string, status: 'cancelled' | 'completed') => {
    const confirmMsg = status === 'cancelled' 
      ? "Are you sure you want to cancel this booking?" 
      : "Mark this meeting as completed?";
    
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(id);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: status })
        .eq('id', id);

      if (error) throw error;
      
      success(status === 'cancelled' ? 'Appointment cancelled' : 'Appointment marked completed');
      
      // Delay state update slightly so user sees the loading spinner finish or success state before card moves
      setTimeout(() => {
        setAppointments(prev => prev.map(apt => 
          apt.id === id ? { ...apt, status: status } : apt
        ));
        setActionLoading(null);
      }, 500);
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      showError('Failed to update appointment');
      setActionLoading(null);
    }
  };

  // Filter Logic
  const filteredAppointments = appointments.filter(apt => {
    const date = new Date(apt.date);
    const isPast = date < new Date();

    if (filter === 'upcoming') {
      return !isPast && apt.status !== 'cancelled' && apt.status !== 'completed';
    }
    if (filter === 'completed') {
      return apt.status === 'completed' || (isPast && apt.status !== 'cancelled');
    }
    return true; // All
  });

  return (
    <div>
       <div className="mb-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <h2 className="text-lg font-semibold text-slate-700 mr-4">Schedule</h2>
           <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'upcoming' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'completed' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
              >
                Past/Completed
              </button>
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white shadow text-brand-600' : 'text-slate-500'}`}
              >
                All
              </button>
           </div>
         </div>
         <Button variant="outline" size="sm" onClick={fetchAppointments}>Refresh</Button>
       </div>

       {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600" /></div>
       ) : filteredAppointments.length === 0 ? (
          <Card className="text-center py-16 text-slate-400">
             <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
             <p>No {filter} appointments found.</p>
          </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredAppointments.map(apt => {
             const date = new Date(apt.date);
             const isPast = date < new Date();
             const isProcessing = actionLoading === apt.id;
             
             return (
               <Card key={apt.id} className={`border-l-4 transition-all duration-300 ${
                 apt.status === 'cancelled' ? 'border-l-slate-300 opacity-75' : 
                 apt.status === 'completed' ? 'border-l-green-500 bg-slate-50' :
                 isPast ? 'border-l-slate-400 bg-slate-50' : 
                 'border-l-brand-500 hover:shadow-lg'
               }`}>
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                      <Loader2 className="animate-spin text-brand-600" />
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                     <div className="bg-slate-100 rounded-lg p-2 text-center min-w-[60px]">
                        <div className="text-xs font-bold text-slate-500 uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                        <div className="text-xl font-bold text-slate-900">{date.getDate()}</div>
                     </div>
                     <Badge variant={
                       apt.status === 'cancelled' ? 'neutral' : 
                       apt.status === 'completed' ? 'success' :
                       isPast ? 'warning' : 'info'
                     }>
                        {apt.status === 'cancelled' ? 'Cancelled' : 
                         apt.status === 'completed' ? 'Completed' :
                         isPast ? 'Overdue' : 'Confirmed'}
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

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                       <>
                        <button 
                          onClick={() => updateStatus(apt.id, 'completed')}
                          disabled={isProcessing}
                          className="text-green-600 text-sm hover:text-green-800 flex items-center px-3 py-1.5 rounded hover:bg-green-50 border border-transparent hover:border-green-200 transition-all font-medium disabled:opacity-50"
                          title="Mark as completed"
                        >
                          <CheckCircle size={16} className="mr-1.5" /> Complete
                        </button>
                        <button 
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          disabled={isProcessing}
                          className="text-red-500 text-sm hover:text-red-700 flex items-center px-3 py-1.5 rounded hover:bg-red-50 border border-transparent hover:border-red-200 transition-all font-medium disabled:opacity-50"
                          title="Cancel meeting"
                        >
                          <XCircle size={16} className="mr-1.5" /> Cancel
                        </button>
                       </>
                    )}
                  </div>
               </Card>
             );
           })}
         </div>
       )}
    </div>
  );
};

export default AdminAppointments;