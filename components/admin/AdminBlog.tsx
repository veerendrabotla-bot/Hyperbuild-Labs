import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { BlogPost } from '../../types';
import Button from '../Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import { Loader2, Edit2, Trash2, Save, X, ImageIcon, Bold, Italic, Heading, List, Plus, Search, UploadCloud, Eye } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminBlog: React.FC = () => {
  const { success, error: showError } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: '',
    category: 'AI Trends',
    content: '',
    excerpt: '',
    image: 'https://picsum.photos/800/400',
    tags: [],
    author: 'Admin'
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data as any[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
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
      
      setCurrentPost({ ...currentPost, image: data.publicUrl });
      success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePost = async () => {
    if (!currentPost.title || !currentPost.content) {
      showError('Title and Content are required');
      return;
    }

    const readTime = `${Math.ceil((currentPost.content.length || 0) / 1000)} min read`;
    const postData = { ...currentPost, read_time: readTime, date: new Date().toLocaleDateString() };

    try {
      if (currentPost.id) {
        const { error } = await supabase.from('posts').update(postData).eq('id', currentPost.id);
        if (error) throw error;
        success('Post updated successfully');
      } else {
        const { error } = await supabase.from('posts').insert([postData]);
        if (error) throw error;
        success('Post created successfully');
      }
      setIsModalOpen(false);
      fetchPosts();
      resetPostForm();
    } catch (error) {
      console.error('Error saving post:', error);
      showError('Failed to save post.');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== id));
      success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      showError('Failed to delete post');
    }
  };

  const resetPostForm = () => {
    setCurrentPost({
      title: '',
      category: 'AI Trends',
      content: '',
      excerpt: '',
      image: 'https://picsum.photos/800/400',
      tags: [],
      author: 'Admin'
    });
    setTagInput('');
  };

  const openCreateModal = () => {
    resetPostForm();
    setIsModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setCurrentPost(post);
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !currentPost.tags?.includes(tagInput.trim())) {
      setCurrentPost(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentPost(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagToRemove) }));
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentPost.content || '';
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const newText = before + textToInsert + after;
    setCurrentPost({ ...currentPost, content: newText });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
           <Input 
             placeholder="Search posts..." 
             value={searchTerm} 
             onChange={(e) => setSearchTerm(e.target.value)}
             icon={<Search size={18} />}
           />
        </div>
        <Button onClick={openCreateModal} leftIcon={<Plus size={18} />}>
          Create Post
        </Button>
      </div>

      {isLoadingPosts ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="text-center py-20 text-slate-400">
          <p>No posts found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map(post => (
            <Card key={post.id} className="hover:border-brand-300 transition-colors" noPadding>
              <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                 <img 
                   src={post.image} 
                   alt={post.title} 
                   className="w-full md:w-24 h-24 object-cover rounded-lg bg-slate-100" 
                   onError={(e) => (e.currentTarget.src = 'https://picsum.photos/200/200')}
                 />
                 <div className="flex-1 w-full">
                   <div className="flex items-center justify-between mb-1">
                      <Badge variant="info">{post.category}</Badge>
                      <span className="text-xs text-slate-400">{post.date}</span>
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg mb-1">{post.title}</h3>
                   <p className="text-sm text-slate-500 line-clamp-1">{post.excerpt}</p>
                 </div>
                 <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                   <Button variant="outline" size="sm" onClick={() => openEditModal(post)} leftIcon={<Edit2 size={16} />}>Edit</Button>
                   <Button variant="danger" size="sm" onClick={() => handleDeletePost(post.id)}><Trash2 size={16} /></Button>
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Split-Screen Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentPost.id ? "Edit Blog Post" : "Create New Post"}
        size="xl" 
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
          {/* Left Column: Editor */}
          <div className="overflow-y-auto pr-4 custom-scrollbar space-y-6">
             <div>
               <Input 
                 label="Title"
                 value={currentPost.title}
                 onChange={(e) => setCurrentPost({...currentPost, title: e.target.value})}
                 placeholder="Enter post title..."
               />
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select 
                    value={currentPost.category} 
                    onChange={(e) => setCurrentPost({...currentPost, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option>AI Trends</option>
                    <option>Web Development</option>
                    <option>Strategy</option>
                    <option>Automation</option>
                  </select>
                </div>
                
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Cover Image</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input 
                        value={currentPost.image}
                        onChange={(e) => setCurrentPost({...currentPost, image: e.target.value})}
                        placeholder="Upload or paste URL..."
                        icon={<ImageIcon size={16} />}
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        id="blog-image-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="blog-image-upload"
                        className={`flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? <Loader2 size={20} className="animate-spin text-brand-600" /> : <UploadCloud size={20} className="text-slate-600" />}
                      </label>
                    </div>
                  </div>
                </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Excerpt</label>
               <textarea 
                 value={currentPost.excerpt} 
                 onChange={(e) => setCurrentPost({...currentPost, excerpt: e.target.value})}
                 rows={3}
                 className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
                 placeholder="Brief summary..."
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Content (Rich Text)</label>
               
               {/* Editor Toolbar */}
               <div className="flex items-center gap-1 mb-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                  <button type="button" onClick={() => insertTextAtCursor('<b></b>')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all" title="Bold"><Bold size={16} /></button>
                  <button type="button" onClick={() => insertTextAtCursor('<i></i>')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all" title="Italic"><Italic size={16} /></button>
                  <div className="w-px h-4 bg-slate-300 mx-1"></div>
                  <button type="button" onClick={() => insertTextAtCursor('<h3></h3>')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all" title="Heading 3"><Heading size={16} /></button>
                  <button type="button" onClick={() => insertTextAtCursor('<ul>\n  <li></li>\n</ul>')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all" title="List"><List size={16} /></button>
               </div>

               <textarea 
                 id="post-content"
                 value={currentPost.content} 
                 onChange={(e) => setCurrentPost({...currentPost, content: e.target.value})}
                 rows={15}
                 className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 font-mono text-sm leading-relaxed"
                 placeholder="Write your article content here (HTML supported)..."
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
               <div className="flex items-center mb-2 gap-2">
                 <Input 
                   value={tagInput}
                   onChange={(e) => setTagInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                   placeholder="Add a tag..."
                   className="flex-1"
                 />
                 <Button onClick={handleAddTag} variant="secondary">Add</Button>
               </div>
               <div className="flex flex-wrap gap-2 min-h-[30px]">
                 {currentPost.tags?.map((tag, idx) => (
                   <Badge key={idx} variant="neutral" className="pl-3 pr-1 py-1">
                     {tag}
                     <button onClick={() => handleRemoveTag(tag)} className="ml-2 p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500"><X size={12} /></button>
                   </Badge>
                 ))}
               </div>
             </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:flex flex-col border-l border-slate-100 pl-8 overflow-hidden bg-slate-50/50 rounded-r-xl">
             <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-500 text-sm uppercase flex items-center">
                  <Eye size={16} className="mr-2"/> Live Preview
                </h3>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-white rounded-xl shadow-sm border border-slate-100 p-8">
               {/* Simulated Blog Post View */}
               <div className="max-w-prose mx-auto">
                 <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                   {currentPost.category || 'Category'}
                 </span>
                 <h1 className="text-2xl font-extrabold text-slate-900 mb-4 leading-tight">
                   {currentPost.title || 'Your Post Title'}
                 </h1>
                 
                 <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden mb-6">
                    {currentPost.image && (
                      <img src={currentPost.image} alt="Cover" className="w-full h-full object-cover" />
                    )}
                 </div>

                 <div 
                   className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-600 prose-img:rounded-xl"
                   dangerouslySetInnerHTML={{ __html: currentPost.content || '<p class="text-slate-400 italic">Start writing to see the preview...</p>' }}
                 />
               </div>
             </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
           <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="mr-3">Cancel</Button>
           <Button onClick={handleSavePost} leftIcon={<Save size={18} />}>Save Post</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminBlog;