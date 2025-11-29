import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Task } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { Plus, MoreHorizontal, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminKanban: React.FC = () => {
  const { success, error: showError } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', status: 'todo', priority: 'medium' });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  };

  const handleSaveTask = async () => {
    if (!newTask.title) return;
    try {
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) throw error;
      success('Task created');
      setIsModalOpen(false);
      setNewTask({ title: '', status: 'todo', priority: 'medium' });
      fetchTasks();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateStatus = async (id: string, status: Task['status']) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    await supabase.from('tasks').update({ status }).eq('id', id);
  };

  const Column = ({ title, status, items }: { title: string, status: Task['status'], items: Task[] }) => (
    <div className="flex-1 min-w-[280px] bg-slate-100/50 rounded-xl p-4 border border-slate-200 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{title}</h3>
        <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{items.length}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
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
              {task.due_date && <div className="text-xs text-slate-400 flex items-center"><Calendar size={12} className="mr-1"/> {new Date(task.due_date).toLocaleDateString()}</div>}
              
              {/* Quick Move Buttons */}
              <div className="flex gap-1">
                 {status !== 'todo' && <button onClick={() => updateStatus(task.id, 'todo')} className="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-500" title="Move to Todo"></button>}
                 {status !== 'in-progress' && <button onClick={() => updateStatus(task.id, 'in-progress')} className="w-2 h-2 rounded-full bg-blue-300 hover:bg-blue-500" title="Move to In Progress"></button>}
                 {status !== 'done' && <button onClick={() => updateStatus(task.id, 'done')} className="w-2 h-2 rounded-full bg-green-300 hover:bg-green-500" title="Move to Done"></button>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={() => { setNewTask(prev => ({ ...prev, status })); setIsModalOpen(true); }}
        className="mt-3 w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm hover:bg-white hover:text-brand-600 hover:border-brand-300 transition-colors flex items-center justify-center"
      >
        <Plus size={16} className="mr-1"/> Add Task
      </button>
    </div>
  );

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
            <Column title="To Do" status="todo" items={tasks.filter(t => t.status === 'todo')} />
            <Column title="In Progress" status="in-progress" items={tasks.filter(t => t.status === 'in-progress')} />
            <Column title="Review" status="review" items={tasks.filter(t => t.status === 'review')} />
            <Column title="Done" status="done" items={tasks.filter(t => t.status === 'done')} />
         </div>
       )}

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task">
          <div className="space-y-4">
            <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="e.g. Design Homepage"/>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                 <select 
                   className="w-full px-4 py-2 border rounded-lg"
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
                   className="w-full px-4 py-2 border rounded-lg"
                   onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                 />
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