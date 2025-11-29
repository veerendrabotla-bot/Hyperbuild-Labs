import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, FileText, Briefcase, Zap, Loader2 } from 'lucide-react';
import { SERVICES, PORTFOLIO, BLOG_POSTS } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { SearchResult } from '../types';

const SearchOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenSearch = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('open-search', handleOpenSearch);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const searchQuery = query.toLowerCase();
      const newResults: SearchResult[] = [];

      // 1. Static Services Search (Immediate)
      SERVICES.forEach(service => {
        if (service.title.toLowerCase().includes(searchQuery) || service.description.toLowerCase().includes(searchQuery)) {
          newResults.push({
            id: service.id,
            title: service.title,
            type: 'service',
            description: service.description,
            link: '/services'
          });
        }
      });

      try {
        // 2. Dynamic Search from Supabase (Projects & Blogs)
        const [projectsResponse, postsResponse] = await Promise.all([
          supabase.from('projects').select('id, title, description, category').ilike('title', `%${query}%`).limit(5),
          supabase.from('posts').select('id, title, excerpt, category').ilike('title', `%${query}%`).limit(5)
        ]);

        // Process Projects
        const dbProjects = projectsResponse.data || [];
        // Fallback to static if DB is empty/error, or merge logic if preferred. 
        // Here we prioritize DB, but also check static if DB returns nothing for better demo experience
        const staticProjects = PORTFOLIO.filter(p => 
          p.title.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery)
        );
        
        // Merge unique projects (DB takes precedence)
        const projectIds = new Set(dbProjects.map(p => p.id));
        const combinedProjects = [
          ...dbProjects.map(p => ({
            id: p.id,
            title: p.title,
            type: 'project' as const,
            description: p.description,
            link: `/portfolio/${p.id}`
          })),
          ...staticProjects.filter(p => !projectIds.has(p.id)).map(p => ({
            id: p.id,
            title: p.title,
            type: 'project' as const,
            description: p.description,
            link: `/portfolio/${p.id}`
          }))
        ];

        // Process Posts
        const dbPosts = postsResponse.data || [];
        const staticPosts = BLOG_POSTS.filter(p => 
          p.title.toLowerCase().includes(searchQuery) || p.excerpt.toLowerCase().includes(searchQuery)
        );
        
        const postIds = new Set(dbPosts.map(p => p.id));
        const combinedPosts = [
          ...dbPosts.map(p => ({
            id: p.id,
            title: p.title,
            type: 'blog' as const,
            description: p.excerpt,
            link: `/blog/${p.id}`
          })),
          ...staticPosts.filter(p => !postIds.has(p.id)).map(p => ({
            id: p.id,
            title: p.title,
            type: 'blog' as const,
            description: p.excerpt,
            link: `/blog/${p.id}`
          }))
        ];

        setResults([...newResults, ...combinedProjects, ...combinedPosts]);

      } catch (error) {
        console.error("Search error:", error);
        // Fallback to static on error
        setResults(newResults); 
      } finally {
        setIsSearching(false);
      }

    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleResultClick = (link: string) => {
    setIsOpen(false);
    navigate(link);
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4 transition-opacity duration-200">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center p-4 border-b border-slate-100">
          <Search className="text-slate-400 w-5 h-5 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for services, projects, or insights..."
            className="flex-1 outline-none text-lg text-slate-800 placeholder:text-slate-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() === '' && (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">Type to start searching...</p>
              <div className="mt-4 flex justify-center gap-2 text-xs">
                <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Services</span>
                <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Projects</span>
                <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">Blog</span>
              </div>
            </div>
          )}

          {isSearching ? (
             <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-500" />
                <p className="text-sm">Searching database...</p>
             </div>
          ) : query.trim() !== '' && results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Results</div>
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}-${idx}`}
                  onClick={() => handleResultClick(result.link)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-50 flex items-start group transition-colors border-l-2 border-transparent hover:border-brand-500"
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    result.type === 'service' ? 'bg-blue-100 text-blue-600' :
                    result.type === 'project' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {result.type === 'service' && <Zap size={16} />}
                    {result.type === 'project' && <Briefcase size={16} />}
                    {result.type === 'blog' && <FileText size={16} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-700">{result.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{result.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        
        <div className="bg-slate-50 p-2 text-center text-xs text-slate-400 border-t border-slate-100">
           Pro tip: Press <kbd className="font-sans px-1 py-0.5 rounded bg-white border border-slate-300">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;