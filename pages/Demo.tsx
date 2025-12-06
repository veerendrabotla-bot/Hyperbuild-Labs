import React, { useState, useRef, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import { Bot, Send, User, RefreshCw, Sparkles } from 'lucide-react';
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
    { id: 1, text: "Hi there! I'm the HyperBuild AI Sales Agent. I can calculate quotes, explain our tech stack, or schedule a meeting. How can I help?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Store fetched data for AI Context
  const [dynamicContext, setDynamicContext] = useState({ services: SERVICES, pricing: PRICING });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch real data on load to train AI
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
      // Initialize Gemini Client
      // The API key must be obtained exclusively from process.env.API_KEY and used directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct context about the agency
      const agencyContext = `
        You are a helpful, professional, and persuasive Sales Representative for 'HyperBuild Labs', an AI & Web Development Agency.
        
        YOUR GOAL: Answer questions, explain services, and encourage the user to 'Book a Consultation'.
        
        AGENCY DETAILS:
        - Name: HyperBuild Labs
        - Focus: Enterprise-grade websites, AI Agents, CRM Automation.
        - Tone: Professional, Tech-savvy, Confident.
        
        SERVICES & PRICING CONTEXT (Real Database Data):
        ${JSON.stringify(dynamicContext.services)}
        ${JSON.stringify(dynamicContext.pricing)}
        
        RULES:
        1. Keep responses concise (under 50 words usually).
        2. If asked about price, mention the specific prices from the context provided above.
        3. Always be polite.
        4. If you don't know something, suggest booking a consultation.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userText,
        config: {
          systemInstruction: agencyContext,
        },
      });

      const aiResponseText = response.text || "I'm having trouble connecting to the server right now. Please try again or book a consultation!";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiResponseText, sender: 'ai' }]);
    } catch (error) {
      console.error("AI Error:", error);
      // Fallback simulation if API fails or key is missing
      setTimeout(() => {
        const fallbackResponse = "I'm currently experiencing high traffic (Demo Mode Limit). However, our team would love to chat! Please head to the Contact page.";
        setMessages(prev => [...prev, { id: Date.now() + 1, text: fallbackResponse, sender: 'ai' }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <SEO 
        title="Interactive AI Demos" 
        description="Interact with our AI Chatbot demo and see how our automation tools can enhance your customer support and lead generation in real-time." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Live AI Agent Demo" 
          subtitle="This isn't a script. This is a real AI agent trained on our agency's data. Try asking it about pricing or our tech stack."
        />

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Chat Header */}
          <div className="bg-brand-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full mr-3 relative">
                <Bot size={24} aria-hidden="true" />
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                  <Sparkles size={8} className="text-brand-900" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h3 className="font-bold">HyperBuild Assistant (Live)</h3>
                <p className="text-xs text-brand-100 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" aria-hidden="true"></span> Powered by Gemini 2.5
                </p>
              </div>
            </div>
            <button 
              onClick={() => setMessages([{ id: 1, text: "Hi there! I'm the HyperBuild AI Sales Agent. I can calculate quotes, explain our tech stack, or schedule a meeting. How can I help?", sender: 'ai' }])} 
              className="text-brand-100 hover:text-white transition-colors p-1 rounded hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Restart conversation"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Chat Window */}
          <div className="h-96 overflow-y-auto p-6 bg-slate-50 space-y-4" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.sender === 'user' ? 'bg-secondary-800 ml-2' : 'bg-brand-600 mr-2'}`} aria-hidden="true">
                    {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-secondary-800 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start" aria-label="AI is typing">
                 <div className="flex flex-row">
                   <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1 mr-2" aria-hidden="true">
                     <Bot size={14} className="text-white" />
                   </div>
                   <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 flex items-center">
                     <div className="flex space-x-1.5">
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100"></div>
                       <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200"></div>
                     </div>
                   </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about pricing, AI services, or custom dev..."
                aria-label="Type your message to the AI assistant"
                className="flex-1 border border-slate-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              AI can make mistakes. Please verify pricing with our team.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center bg-brand-50 p-8 rounded-xl border border-brand-100 max-w-3xl mx-auto">
          <h4 className="font-bold text-slate-900 mb-2">Impressive, right?</h4>
          <p className="text-slate-600 mb-6 text-sm">
            We can build a custom agent like this for your business—trained on your PDF data, customer support logs, and pricing sheets.
          </p>
          <button className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors" onClick={() => window.location.hash = '#contact'}>
            Build My AI Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;