import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Project } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Loader2, Edit2, Trash2, Save, X, ImageIcon, Plus, Briefcase, UploadCloud, Eye, ArrowUpRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminProjects: React.FC = () => {
  const { success, error: showError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    category: 'Web Development',
    image: 'https://picsum.photos/800/600',
    description: '',
    impact: '',
    techStack: [],
    client: '',
    duration: '',
    challenge: '',
    solution: '',
    results: []
  });
  const [techStackInput, setTechStackInput] = useState('');
  const [resultInput, setResultInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const mappedProjects = (data || []).map((p: any) => ({
        ...p,
        techStack: p.tech_stack || [],
        results: p.results || []
      }));

      setProjects(mappedProjects as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setIsUploading(true);

    try {
      // Upload to 'uploads' bucket
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      
      setCurrentProject({ ...currentProject, image: data.publicUrl });
      success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject.title || !currentProject.description) {
      showError('Title and Description are required');
      return;
    }

    const projectDBData = {
      title: currentProject.title,
      category: currentProject.category,
      image: currentProject.image,
      description: currentProject.description,
      impact: currentProject.impact,
      client: currentProject.client,
      duration: currentProject.duration,
      challenge: currentProject.challenge,
      solution: currentProject.solution,
      tech_stack: currentProject.techStack,
      results: currentProject.results
    };

    try {
      if (currentProject.id) {
        const { error } = await supabase.from('projects').update(projectDBData).eq('id', currentProject.id);
        if (error) throw error;
        success('Project updated successfully');
      } else {
        const { error } = await supabase.from('projects').insert([projectDBData]);
        if (error) throw error;
        success('Project added successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
      resetProjectForm();
    } catch (error) {
      console.error('Error saving project:', error);
      showError('Failed to save project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      success('Project deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      showError('Failed to delete project');
    }
  };

  const resetProjectForm = () => {
    setCurrentProject({
      title: '',
      category: 'Web Development',
      image: 'https://picsum.photos/800/600',
      description: '',
      impact: '',
      techStack: [],
      client: '',
      duration: '',
      challenge: '',
      solution: '',
      results: []
    });
    setTechStackInput('');
    setResultInput('');
  };

  const openCreateModal = () => {
    resetProjectForm();
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setIsModalOpen(true);
  };

  const handleAddTech = () => {
    if (techStackInput.trim() && !currentProject.techStack?.includes(techStackInput.trim())) {
      setCurrentProject(prev => ({ ...prev, techStack: [...(prev.techStack || []), techStackInput.trim()] }));
      setTechStackInput('');
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setCurrentProject(prev => ({ ...prev, techStack: prev.techStack?.filter(t => t !== techToRemove) }));
  };

  const handleAddResult = () => {
    if (resultInput.trim()) {
      setCurrentProject(prev => ({ ...prev, results: [...(prev.results || []), resultInput.trim()] }));
      setResultInput('');
    }
  };

  const handleRemoveResult = (index: number) => {
    setCurrentProject(prev => ({ 
      ...prev, 
      results: prev.results?.filter((_, i) => i !== index) 
    }));
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Add Project
        </Button>
      </div>

      {isLoadingProjects ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No projects found. Add your first portfolio item!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="group relative overflow-hidden hover:shadow-lg transition-all" noPadding>
              <div className="h-40 overflow-hidden relative">
                 <img 
                   src={project.image} 
                   alt={project.title} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-100" 
                   onError={(e) => (e.currentTarget.src = 'https://picsum.photos/400/300')}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button onClick={() => openEditModal(project)} className="p-1.5 bg-white text-brand-600 rounded-full hover:bg-brand-50"><Edit2 size={14} /></button>
                   <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"><Trash2 size={14} /></button>
                 </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                     <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider border border-brand-100 px-1.5 py-0.5 rounded">{project.category}</span>
                     <h3 className="font-bold text-slate-900 mt-2 text-lg leading-tight">{project.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.techStack.slice(0,3).map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Split Screen Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProject.id ? "Edit Project" : "Add New Project"}
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
          {/* Left Column: Form */}
          <div className="overflow-y-auto pr-4 custom-scrollbar space-y-6">
            <div className="grid grid-cols-1 gap-6">
               <Input 
                 label="Project Title"
                 value={currentProject.title}
                 onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})}
                 placeholder="e.g. FinFlow AI"
               />
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                 <select 
                    value={currentProject.category} 
                    onChange={(e) => setCurrentProject({...currentProject, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option>Web Development</option>
                    <option>AI Solutions</option>
                    <option>E-commerce</option>
                    <option>Automation</option>
                    <option>Branding</option>
                    <option>SaaS Platform</option>
                  </select>
               </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover Image</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    value={currentProject.image}
                    onChange={(e) => setCurrentProject({...currentProject, image: e.target.value})}
                    placeholder="Upload or paste URL..."
                    icon={<ImageIcon size={16} />}
                  />
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    id="project-image-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <label 
                    htmlFor="project-image-upload"
                    className={`flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin text-brand-600" /> : <UploadCloud size={20} className="text-slate-600" />}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description</label>
              <textarea 
                value={currentProject.description} 
                onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                placeholder="Brief overview for the card..."
              />
            </div>

            <Input 
              label="Impact / Headline Result"
              value={currentProject.impact}
              onChange={(e) => setCurrentProject({...currentProject, impact: e.target.value})}
              placeholder="e.g. 200% Increase in Traffic"
            />

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-6">
               <Input 
                 label="Client Name"
                 value={currentProject.client}
                 onChange={(e) => setCurrentProject({...currentProject, client: e.target.value})}
               />
               <Input 
                 label="Duration"
                 value={currentProject.duration}
                 onChange={(e) => setCurrentProject({...currentProject, duration: e.target.value})}
                 placeholder="e.g. 3 Months"
               />
            </div>

            {/* Tech Stack */}
            <div>
             <label className="block text-sm font-medium text-slate-700 mb-1.5">Tech Stack</label>
             <div className="flex items-center mb-2 gap-2">
               <Input 
                 value={techStackInput}
                 onChange={(e) => setTechStackInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddTech()}
                 placeholder="e.g. React"
                 className="flex-1"
               />
               <Button onClick={handleAddTech} variant="secondary">Add</Button>
             </div>
             <div className="flex flex-wrap gap-2 min-h-[30px]">
               {currentProject.techStack?.map((tech, idx) => (
                 <Badge key={idx} variant="neutral" className="pl-3 pr-1 py-1">
                   {tech}
                   <button onClick={() => handleRemoveTech(tech)} className="ml-2 p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500"><X size={12} /></button>
                 </Badge>
               ))}
             </div>
           </div>

           {/* Case Study Details */}
           <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center"><Briefcase size={18} className="mr-2 text-brand-500"/> Case Study Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">The Challenge</label>
                  <textarea 
                    value={currentProject.challenge} 
                    onChange={(e) => setCurrentProject({...currentProject, challenge: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">The Solution</label>
                  <textarea 
                    value={currentProject.solution} 
                    onChange={(e) => setCurrentProject({...currentProject, solution: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Results (Bullet Points)</label>
                  <div className="flex items-center mb-2 gap-2">
                    <Input 
                      value={resultInput}
                      onChange={(e) => setResultInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddResult()}
                      placeholder="e.g. 50% Reduction in Costs"
                      className="flex-1"
                    />
                    <Button onClick={handleAddResult} variant="secondary">Add</Button>
                  </div>
                  <ul className="space-y-2">
                    {currentProject.results?.map((res, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-md shadow-sm">
                        <span className="text-sm text-slate-700">{res}</span>
                        <button onClick={() => handleRemoveResult(idx)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
           </div>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="hidden lg:flex flex-col border-l border-slate-100 pl-8 overflow-hidden bg-slate-50/50 rounded-r-xl">
             <div className="flex items-center justify-between mb-8 pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-500 text-sm uppercase flex items-center">
                  <Eye size={16} className="mr-2"/> Live Card Preview
                </h3>
             </div>
             
             <div className="flex items-start justify-center p-4">
               {/* Visual Replica of ProjectCard */}
               <div className="group relative block bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100 max-w-sm w-full">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={currentProject.image || 'https://picsum.photos/800/600'} 
                      alt={currentProject.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                         {currentProject.category || 'Category'}
                       </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {currentProject.title || 'Project Title'}
                    </h3>
                    <p className="text-slate-600 mb-4 text-sm line-clamp-2">
                      {currentProject.description || 'Project description will appear here...'}
                    </p>
                    
                    <div className="mb-4">
                        <span className="text-sm font-semibold text-brand-600">Impact: </span>
                        <span className="text-sm text-slate-700 font-medium">
                          {currentProject.impact || 'Impact Statement'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {currentProject.techStack?.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                      {(currentProject.techStack?.length || 0) > 3 && (
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                          +{(currentProject.techStack?.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </div>
               </div>
             </div>
             <p className="text-center text-xs text-slate-400 mt-4">
               This is how it will appear on the Portfolio page.
             </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 mt-6">
           <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="mr-3">Cancel</Button>
           <Button onClick={handleSaveProject} leftIcon={<Save size={18} />}>Save Project</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProjects;