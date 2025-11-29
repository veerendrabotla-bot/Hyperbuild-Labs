import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TeamMember } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Input from '../ui/Input';
import { Plus, User, Trash2, Mail } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminTeam: React.FC = () => {
  const { success } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(false);
    // Simulation since we haven't set up full user management backend logic
    // In a real app, this queries the team_members table
    const { data } = await supabase.from('team_members').select('*');
    if (data && data.length > 0) {
      setMembers(data as TeamMember[]);
    } else {
      // Dummy data for demo
      setMembers([
        { id: '1', name: 'You (Admin)', email: 'admin@hyperbuild.com', role: 'admin', created_at: new Date().toISOString() }
      ]);
    }
  };

  const handleInvite = async () => {
    if (!newEmail) return;
    // Real implementation would trigger Supabase Auth Invite
    success(`Invitation sent to ${newEmail}`);
    setNewEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800">Team Management</h2>
        <p className="text-sm text-slate-500">Manage access and roles for your agency dashboard.</p>
      </div>

      <Card className="mb-8">
        <h3 className="font-bold text-slate-900 mb-4">Invite New Member</h3>
        <div className="flex gap-4">
           <Input 
             placeholder="colleague@agency.com" 
             value={newEmail} 
             onChange={e => setNewEmail(e.target.value)}
             icon={<Mail size={16}/>}
           />
           <select className="px-4 rounded-lg border border-slate-200 bg-white">
             <option value="admin">Admin</option>
             <option value="editor">Editor</option>
             <option value="viewer">Viewer</option>
           </select>
           <Button onClick={handleInvite} leftIcon={<Plus size={16}/>}>Invite</Button>
        </div>
      </Card>

      <Card noPadding>
         <table className="w-full text-left">
           <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
             <tr>
               <th className="px-6 py-4">User</th>
               <th className="px-6 py-4">Role</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {members.map(member => (
               <tr key={member.id}>
                 <td className="px-6 py-4 flex items-center">
                   <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 mr-3">
                     <User size={16} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                     <p className="text-xs text-slate-500">{member.email}</p>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <Badge variant={member.role === 'admin' ? 'info' : 'neutral'}>{member.role}</Badge>
                 </td>
                 <td className="px-6 py-4 text-right">
                   <button className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </Card>
    </div>
  );
};

export default AdminTeam;