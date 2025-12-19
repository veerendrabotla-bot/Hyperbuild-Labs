
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TeamMember } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import { 
  User, Trash2, Loader2, RefreshCw, CheckCircle, 
  ShieldAlert, X, UserPlus, Inbox, ShieldCheck 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminTeam: React.FC = () => {
  const { success, error: showError } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data as TeamMember[] || []);
    } catch (error: any) {
      console.error('Error fetching team:', error);
      showError('Database link failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(id);
    try {
      const { error: dbError } = await supabase
        .from('team_members')
        .update({ 
          is_approved: true, 
          role: 'employee' 
        })
        .eq('id', id);

      if (dbError) throw dbError;
      
      success('Partner access granted');
      await fetchTeam();
    } catch (err: any) {
      showError('Approval failed: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Decline and delete this application?')) return;
    setIsProcessing(id);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      success('Application purged');
      await fetchTeam();
    } catch (err: any) {
      showError('Decline failed: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('IRREVERSIBLE: Remove this user from the system?')) return;
    setIsProcessing(id);
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== id));
      success('User purged from ledger');
    } catch (err: any) {
      showError('Delete failed: ' + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const pendingPartners = members.filter(m => m.is_approved === false);
  const activeTeam = members.filter(m => m.is_approved === true);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-600" />
        <p className="text-[10px] font-black uppercase tracking-widest">Scanning Ledger...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn">
      <section>
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-200">
                <ShieldAlert size={24}/>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Access Requests</h3>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Verification required for Partner Hub</p>
              </div>
           </div>
           <Badge variant="warning" className="px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
              {pendingPartners.length} QUEUED
           </Badge>
        </div>

        {pendingPartners.length === 0 ? (
          <Card className="bg-slate-50/50 border-dashed border-slate-200 py-16 text-center">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <Inbox className="text-slate-300" size={24} />
             </div>
             <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm">No Pending Applications</h4>
             <button onClick={fetchTeam} className="mt-6 text-brand-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mx-auto hover:text-brand-700">
               <RefreshCw size={12} /> Sync Database
             </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {pendingPartners.map(m => (
               <Card key={m.id} className="border-orange-200 bg-white shadow-xl group overflow-hidden" noPadding>
                  <div className="p-6 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center font-black text-orange-600 border border-orange-100 text-xl">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-slate-900 text-lg leading-tight">{m.name}</p>
                           <p className="text-xs text-slate-400 font-medium mt-1">{m.email}</p>
                        </div>
                     </div>
                     <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleApprove(m.id)} 
                          disabled={isProcessing === m.id}
                          className="p-3 bg-brand-600 text-white rounded-xl shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50"
                        >
                          {isProcessing === m.id ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20}/>}
                        </button>
                        <button 
                          onClick={() => handleReject(m.id)} 
                          disabled={isProcessing === m.id}
                          className="p-3 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <X size={20}/>
                        </button>
                     </div>
                  </div>
               </Card>
             ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex justify-between items-end mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm border border-brand-200">
                <ShieldCheck size={24}/>
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Authenticated Nodes</h3>
                 <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Authorized directory of members</p>
              </div>
           </div>
           <button onClick={fetchTeam} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand-600 transition-all">
             <RefreshCw size={20}/>
           </button>
        </div>
        
        <Card noPadding className="border-slate-200 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                   <tr>
                      <th className="px-6 py-4">Identity</th>
                      <th className="px-6 py-4">Authorization</th>
                      <th className="px-6 py-4">Member Since</th>
                      <th className="px-6 py-4 text-right">Ledger Ops</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {activeTeam.map(member => (
                     <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 text-sm flex items-center gap-2">
                                   {member.name}
                                   {member.role === 'admin' && <ShieldCheck size={12} className="text-brand-600" />}
                                 </p>
                                 <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <Badge variant={member.role === 'admin' ? 'info' : 'success'} className="uppercase font-black text-[9px] tracking-widest">
                              {member.role.toUpperCase()}
                           </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-500 uppercase">{new Date(member.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                           {member.role !== 'admin' && (
                             <button 
                              onClick={() => handleDelete(member.id)} 
                              disabled={isProcessing === member.id}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                             >
                               {isProcessing === member.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18}/>}
                             </button>
                           )}
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </Card>
      </section>
    </div>
  );
};

export default AdminTeam;
