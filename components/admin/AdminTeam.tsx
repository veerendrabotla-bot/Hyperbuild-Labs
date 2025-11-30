import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TeamMember } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Input from '../ui/Input';
import { Plus, User, Trash2, Mail, Loader2, RefreshCw, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import Modal from '../ui/Modal';

const AdminTeam: React.FC = () => {
  const { success, error: showError } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
      setMembers(data as TeamMember[]);
    } catch (error: any) {
      console.error('Error fetching team:', error);
      showError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newEmail || !newName) {
      showError('Name and Email are required');
      return;
    }
    
    setIsInviting(true);

    try {
      // 1. Insert into database (Permissions tracking)
      const { error } = await supabase.from('team_members').insert([
        {
          name: newName,
          email: newEmail,
          role: newRole,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random`
        }
      ]);

      if (error) throw error;

      success(`${newName} added to team list`);
      setShowInfoModal(true); // Show info about actual login creation
      setNewEmail('');
      setNewName('');
      setNewRole('editor');
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to add team member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this team member? This cannot be undone.')) return;

    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      
      setMembers(prev => prev.filter(m => m.id !== id));
      success('Team member removed');
    } catch (err: any) {
      console.error(err);
      showError('Failed to remove member');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Team Management</h2>
          <p className="text-sm text-slate-500">Manage access and roles for your agency dashboard.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchTeam} leftIcon={<RefreshCw size={14} />}>
          Refresh
        </Button>
      </div>

      <Card className="mb-8">
        <h3 className="font-bold text-slate-900 mb-4">Add Team Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
           <div className="md:col-span-4">
             <Input 
               placeholder="Full Name" 
               value={newName} 
               onChange={e => setNewName(e.target.value)}
               icon={<User size={16}/>}
             />
           </div>
           <div className="md:col-span-4">
             <Input 
               placeholder="colleague@agency.com" 
               value={newEmail} 
               type="email"
               onChange={e => setNewEmail(e.target.value)}
               icon={<Mail size={16}/>}
             />
           </div>
           <div className="md:col-span-2">
             <select 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
             >
               <option value="admin">Admin</option>
               <option value="editor">Editor</option>
               <option value="viewer">Viewer</option>
             </select>
           </div>
           <div className="md:col-span-2">
             <Button 
               onClick={handleInvite} 
               leftIcon={<Plus size={16}/>}
               isLoading={isInviting}
               className="w-full"
             >
               Add
             </Button>
           </div>
        </div>
      </Card>

      <Card noPadding>
         {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
         ) : members.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No team members found. Add one above.
            </div>
         ) : (
           <table className="w-full text-left">
             <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
               <tr>
                 <th className="px-6 py-4">User</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">Joined</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {members.map(member => (
                 <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4 flex items-center">
                     <div className="w-9 h-9 rounded-full bg-slate-100 mr-3 overflow-hidden border border-slate-200">
                       {member.avatar ? (
                         <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-700 font-bold">
                           {member.name.charAt(0)}
                         </div>
                       )}
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                       <p className="text-xs text-slate-500">{member.email}</p>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                     <Badge variant={member.role === 'admin' ? 'info' : member.role === 'editor' ? 'warning' : 'neutral'}>
                       {member.role.toUpperCase()}
                     </Badge>
                   </td>
                   <td className="px-6 py-4 text-sm text-slate-500">
                     {new Date(member.created_at).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 text-right">
                     <button 
                        onClick={() => handleDelete(member.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove member"
                     >
                       <Trash2 size={16}/>
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
      </Card>

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Important: User Login">
        <div className="p-4">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-4 flex items-start">
             <Info className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
             <div>
               <h4 className="font-bold mb-1">One Last Step!</h4>
               <p className="text-sm">
                 You have added <strong>{newName}</strong> to the team list, but for security reasons, client-side applications cannot create passwords for users.
               </p>
             </div>
          </div>
          <p className="mb-4 text-slate-700">To allow them to log in:</p>
          <ol className="list-decimal list-inside space-y-2 mb-6 text-slate-600">
             <li>Go to your <strong>Supabase Dashboard</strong>.</li>
             <li>Navigate to <strong>Authentication</strong> &gt; <strong>Users</strong>.</li>
             <li>Click <strong>Invite User</strong> and enter <strong>{newEmail}</strong>.</li>
          </ol>
          <div className="flex justify-end">
            <Button onClick={() => setShowInfoModal(false)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminTeam;
