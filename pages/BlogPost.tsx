import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../constants';
import Button from '../components/Button';
import SEO from '../components/SEO';
import ScrollReveal from '../components/ScrollReveal';
import { ArrowLeft, Calendar, User, Clock, Share2, ArrowRight } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.id === id);

  if (!post) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Post Not Found</h2>
        <Button onClick={() => navigate('/blog')}>Back to Insights</Button>
      </div>
    );
  }

  // Smart related posts logic: prioritize same category, fill with others
  const relatedPosts = BLOG_POSTS
    .filter(p => p.id !== post.id)
    .sort((a, b) => {
      if (a.category === post.category && b.category !== post.category) return -1;
      if (a.category !== post.category && b.category === post.category) return 1;
      return 0;
    })
    .slice(0, 3);

  return (
    <div className="pt-24 pb-20 bg-white">
      <SEO 
        title={post.title} 
        description={post.excerpt} 
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/blog')} 
          className="mb-8 pl-0 hover:bg-transparent hover:text-brand-600"
          leftIcon={<ArrowLeft size={18} />}
        >
          Back to Insights
        </Button>

        <ScrollReveal>
          <div className="mb-8">
            <span className="bg-brand-50 text-brand-700 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-brand-500" />
                  <span className="font-medium text-slate-900">{post.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-brand-500" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-brand-500" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Share this post">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl mb-12">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto object-cover"
            />
          </div>

          <div 
            className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-700 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </ScrollReveal>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related, idx) => (
                <ScrollReveal key={related.id} delay={idx * 0.1}>
                  <div 
                    className="group cursor-pointer flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100"
                    onClick={() => navigate(`/blog/${related.id}`)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={related.image} 
                        alt={related.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-brand-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          {related.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h4 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2 flex-grow">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center text-brand-600 text-xs font-semibold mt-auto">
                        Read Article <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="bg-secondary-900 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              We help businesses implement these exact strategies. Let's discuss how we can apply them to your company.
            </p>
            <Button onClick={() => navigate('/contact')} size="lg">
              Book a Strategy Call
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;