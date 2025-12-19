
import React, { useState, useRef, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import { Bot, Send, User, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import SEO from '../components/SEO';
import { GoogleGenAI } from "@google/genai";
import { PRICING, SERVICES } from '../constants';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const Demo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Welcome to HyperBuild Labs. I'm your AI Solutions Architect. I can explain our custom automation workflows, calculate pricing for your specific needs, or help you book a strategy call. What are you building today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [dynamicContext, setDynamicContext] = useState({ services: SERVICES, pricing: PRICING });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchContextData = async () => {
      try {
        const [servicesRes, pricingRes] = await Promise.all([
          supabase.from('services').select('*'),
          supabase.from('pricing_tiers').select('*')
        ]);
        
        const services = (servicesRes.data && servicesRes.data.length > 0) ? servicesRes.data : SERVICES;
        const pricing = (pricingRes.data && pricingRes.data.length > 0) ? pricingRes.data : PRICING;
        
        setDynamicContext({ services: services as any, pricing: pricing as any });
      } catch (err) {
        console.warn("AI Demo: Using static context fallback");
      }
    };
    fetchContextData();
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: Message = { id: Date.now(), text: userText, sender: 'user' };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const agencyContext = `
        You are 'Architect', an expert AI & Web Solutions consultant for 'HyperBuild Labs'.
        
        YOUR MISSION:
        1. Convert the user by explaining how our technical expertise (AI, Automation, Web) solves their specific business problems.
        2. Reference specific services: ${dynamicContext.services.map(s => s.title).join(', ')}.
        3. Reference pricing when asked: ${dynamicContext.pricing.map(p => `${p.name}: ${p.price}`).join(', ')}.
        4. Be extremely professional, concise, and technically knowledgeable. Avoid fluff.
        5. If the user seems interested, suggest they 'Book a Discovery Call' via the button at the top of the Contact page.
        
        TONE:
        Direct, high-agency, and enterprise-grade.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: agencyContext,
          temperature: 0.7,
        },
      });

      const aiResponseText = response.text || "I'm currently optimizing my internal neural networks. Please reach out via our contact form for an immediate response!";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: 'ai' }]);
    } catch (error) {
      console.error("AI Error:", error);
      setTimeout(() => {
        const fallbackResponse = "I'm experiencing a high volume of inquiries. For enterprise-grade support, please use our contact form or book a call directly through our scheduler.";
        setMessages(prev => [...prev, { id: Date.now() + 1, text: fallbackResponse, sender: 'ai' }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <SEO 
        title="AI Solutions Architect Demo" 
        description="Interact with our intelligent solutions architect to explore how HyperBuild Labs can automate your revenue and scale your infrastructure." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            Live Cognitive Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Talk to Our Solutions Architect</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Experience our proprietary RAG-trained AI agent. It knows our tech stack, our pricing, and how to build your next big thing.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row h-[600px]">
          {/* Sidebar / Info */}
          <div className="w-full md:w-64 bg-slate-900 p-6 text-white hidden md:flex flex-col">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Capabilities</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5"></div>
                  Budget Estimation
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5"></div>
                  Stack Consultation
                </li>
                <li className="flex items-start gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5"></div>
                  Project Scoping
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold">Model: Gemini 3 Flash</p>
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-bold">Role: Lead Architect</p>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-brand-600" />
                <span className="font-bold text-slate-700">Architect v4.0</span>
              </div>
              <button 
                onClick={() => setMessages([{ id: 1, text: "Welcome to HyperBuild Labs. I'm your AI Solutions Architect. What are you building today?", sender: 'ai' }])}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" role="log">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-secondary-800' : 'bg-brand-600 shadow-lg shadow-brand-500/20'}`}>
                      {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-secondary-900 text-white rounded-br-none shadow-md' 
                        : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start">
                   <div className="flex flex-row items-end gap-3">
                     <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                       <Bot size={14} className="text-white" />
                     </div>
                     <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex items-center">
                       <div className="flex space-x-1.5">
                         <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                         <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                       </div>
                     </div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about pricing or stack..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md shadow-brand-500/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;