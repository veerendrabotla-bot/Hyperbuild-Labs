import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Task, TeamMember } from '../../types';
import Badge from '../ui/Badge';
import Button from '../Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, MoreHorizontal, Calendar, Loader2, User, UserPlus } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

// Extracted Component to prevent re-renders
interface KanbanColumnProps {
  title: string;
  status: Task['status'];
  items: Task[];
  teamMembers: TeamMember[];
  onUpdateStatus: (id: string, status: Task['status']) => void;
  onAddTask: (status: Task['status']) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, items, teamMembers, onUpdateStatus, onAddTask }) => {
  const getAssigneeAvatar = (assigneeName: string | undefined) => {
    if (!assigneeName) return null;
    const member = teamMembers.find(m => m.name === assigneeName);
    if (member?.avatar) {
      return <img src={member.avatar} alt={assigneeName} className="w-6 h-6 rounded-full border-2 border-white" title={assigneeName} />;
    }
    return (
      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold border-2 border-white" title={assigneeName}>
        {assigneeName.charAt(0)}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-[280px] bg-slate-100/50 rounded-xl p-4 border border-slate-200 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{items.length}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {items.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
               <Badge variant={task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'medium' : 'low'}>
                 {task.priority}
               </Badge>
               <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                 <MoreHorizontal size={16} />
               </button>
            </div>
            <p className="font-semibold text-slate-800 text-sm mb-3">{task.title}</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                {task.due_date && <div className="text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1"/> {new Date(task.due_date).toLocaleDateString()}</div>}
                {task.assigned_to && (
                  <div className="flex items-center">
                    {getAssigneeAvatar(task.assigned_to)}
                  </div>
                )}
              </div>
              
              {/* Quick Move Buttons */}
              <div className="flex gap-1">
                 {status !== 'todo' && <button onClick={() => onUpdateStatus(task.id, 'todo')} className="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-500" title="Move to Todo"></button>}
                 {status !== 'in-progress' && <button onClick={() => onUpdateStatus(task.id, 'in-progress')} className="w-2 h-2 rounded-full bg-blue-300 hover:bg-blue-500" title="Move to In Progress"></button>}
                 {status !== 'review' && <button onClick={() => onUpdateStatus(task.id, 'review')} className="w-2 h-2 rounded-full bg-purple-300 hover:bg-purple-500" title="Move to Review"></button>}
                 {status !== 'done' && <button onClick={() => onUpdateStatus(task.id, 'done')} className="w-2 h-2 rounded-full bg-green-300 hover:bg-green-500" title="Move to Done"></button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={() => onAddTask(status)}
        className="mt-3 w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:bg-white hover:text-brand-600 hover:border-brand-300 transition-colors flex items-center justify-center"
      >
        <Plus size={16} className="mr-1"/> Add Task
      </button>
    </div>
  );
};

const AdminKanban: React.FC = () => {
  const { success, error: showError } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', status: 'todo', priority: 'medium', assigned_to: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [tasksRes, teamRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('id, name, avatar')
    ]);
    
    if (tasksRes.data) setTasks(tasksRes.data as Task[]);
    if (teamRes.data) setTeamMembers(teamRes.data as TeamMember[]);
    setLoading(false);
  };

  const handleSaveTask = async () => {
    if (!newTask.title) return;
    try {
      // Don't send empty string for optional assignee if not selected
      const taskPayload = {
        ...newTask,
        assigned_to: newTask.assigned_to || null
      };

      const { error } = await supabase.from('tasks').insert([taskPayload]);
      if (error) throw error;
      success('Task created');
      setIsModalOpen(false);
      setNewTask({ title: '', status: 'todo', priority: 'medium', assigned_to: '' });
      fetchData();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await supabase.from('tasks').update({ status }).eq('id', id);
  };

  const openAddTask = (status: Task['status']) => {
    setNewTask(prev => ({ ...prev, status }));
    setIsModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-lg font-bold text-slate-800">Project Board</h2>
         <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus size={16}/>}>New Task</Button>
       </div>

       {loading ? (
         <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-600"/></div>
       ) : (
         <div className="flex gap-6 overflow-x-auto pb-4 h-full">
            <KanbanColumn title="To Do" status="todo" items={tasks.filter(t => t.status === 'todo')} teamMembers={teamMembers} onUpdateStatus={updateStatus} onAddTask={openAddTask} />
            <KanbanColumn title="In Progress" status="in-progress" items={tasks.filter(t => t.status === 'in-progress')} teamMembers={teamMembers} onUpdateStatus={updateStatus} onAddTask={openAddTask} />
            <KanbanColumn title="Review" status="review" items={tasks.filter(t => t.status === 'review')} teamMembers={teamMembers} onUpdateStatus={updateStatus} onAddTask={openAddTask} />
            <KanbanColumn title="Done" status="done" items={tasks.filter(t => t.status === 'done')} teamMembers={teamMembers} onUpdateStatus={updateStatus} onAddTask={openAddTask} />
         </div>
       )}

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
          <div className="space-y-4">
            <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="e.g. Design Homepage"/>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                 <select 
                   className="w-full px-4 py-2 border rounded-lg bg-white"
                   value={newTask.priority}
                   onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                 >
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                 <input 
                   type="date"
                   className="w-full px-4 py-2 border rounded-lg bg-white"
                   onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                 />
               </div>
            </div>
            
            {/* Assignee Selection */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
               <div className="relative">
                 <select 
                   className="w-full px-4 py-2 pl-10 border rounded-lg bg-white appearance-none"
                   value={newTask.assigned_to}
                   onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                 >
                   <option value="">Unassigned</option>
                   {teamMembers.map(member => (
                     <option key={member.id} value={member.name}>{member.name}</option>
                   ))}
                 </select>
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                   <User size={16} />
                 </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveTask}>Save Task</Button>
            </div>
          </div>
       </Modal>
    </div>
  );
};

export default AdminKanban;