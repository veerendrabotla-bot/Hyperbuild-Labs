
import { 
  Bot, 
  Globe, 
  Zap, 
  Palette, 
  Cpu, 
  MessageSquare, 
  BarChart, 
  Code2, 
  ShoppingCart,
  Smartphone
} from 'lucide-react';
import { Service, Project, PricingTier, Testimonial, FaqItem, BlogPost } from './types';

export const COMPANY_NAME = "HyperBuild Labs";
export const WHATSAPP_LINK = "https://wa.me/1234567890"; // Placeholder

// EmailJS Configuration (Placeholders - Update with your real keys from emailjs.com)
export const EMAILJS_SERVICE_ID = "service_placeholder"; 
export const EMAILJS_TEMPLATE_ID = "template_placeholder"; // Admin Notification
export const EMAILJS_AUTO_REPLY_TEMPLATE_ID = "template_auto_reply_placeholder"; // User Confirmation
export const EMAILJS_INVOICE_TEMPLATE_ID = "template_invoice_placeholder"; // Invoice Notification
export const EMAILJS_PUBLIC_KEY = "public_key_placeholder";

// Supabase Configuration
export const SUPABASE_URL = "https://wdramugnkamysedaxnjm.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcmFtdWdua2FteXNlZGF4bmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTkyNzksImV4cCI6MjA3OTk3NTI3OX0.EQ-Fh5A5QT9atNT7JqEBFyLkSidmaC6TwGbkT_I7j9c";

// Google Analytics
export const GOOGLE_ANALYTICS_ID = "G-XXXXXXXXXX"; // Replace with your Measurement ID

export const SERVICES: Service[] = [
  {
    id: 'ai-chatbots',
    title: 'AI Chatbots & Agents',
    description: 'Intelligent 24/7 customer support agents that learn from your business data.',
    icon: Bot,
    category: 'AI',
    features: ['24/7 Customer Support', 'Lead Qualification', 'Multi-language Support']
  },
  {
    id: 'web-dev',
    title: 'Custom Web Development',
    description: 'High-performance, scalable websites built with modern frameworks.',
    icon: Globe,
    category: 'Web',
    features: ['React/Next.js', 'SEO Optimized', 'Mobile First Design']
  },
  {
    id: 'automation',
    title: 'Business Automation',
    description: 'Streamline operations by connecting your favorite tools automatically.',
    icon: Zap,
    category: 'Automation',
    features: ['WhatsApp Workflows', 'CRM Integration', 'Email Sequences']
  },
  {
    id: 'branding',
    title: 'Branding & Design',
    description: 'Create a memorable brand identity that resonates with your audience.',
    icon: Palette,
    category: 'Branding',
    features: ['Logo Design', 'Brand Guidelines', 'UI/UX Design']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Solutions',
    description: 'Robust online stores designed to convert visitors into loyal customers.',
    icon: ShoppingCart,
    category: 'Web',
    features: ['Shopify/WooCommerce', 'Payment Gateway', 'Inventory Sync']
  },
  {
    id: 'ai-voice',
    title: 'AI Voice Agents',
    description: 'Next-gen voice assistants for handling calls and appointments.',
    icon: MessageSquare,
    category: 'AI',
    features: ['Inbound/Outbound', 'Appointment Booking', 'Natural Voice']
  }
];

export const PORTFOLIO: Project[] = [
  {
    id: 'proj-1',
    title: 'FinFlow AI Dashboard',
    category: 'SaaS Platform',
    image: 'https://picsum.photos/id/48/800/600',
    description: 'A financial analytics platform powered by predictive AI models to help startups manage cash flow.',
    impact: 'Increased user retention by 40%',
    techStack: ['React', 'Python', 'AWS', 'PostgreSQL'],
    client: 'FinFlow Inc.',
    duration: '3 Months',
    challenge: 'FinFlow needed a way to visualize complex financial data for non-technical startup founders. Their existing excel-based reporting was causing high churn rates as users found it too difficult to understand their cash runway.',
    solution: 'We built a modern React dashboard integrated with a Python-based predictive AI model. The system automatically categorizes transactions and projects future cash flow scenarios.',
    // Set mandatory status property for portfolio projects
    status: 'completed',
    // Added mandatory is_portfolio property for public listing
    is_portfolio: true,
    results: [
      '40% increase in user retention within 3 months.',
      'Reduced data processing time by 95%.',
      'Secured Series A funding using the new platform metrics.'
    ]
  },
  {
    id: 'proj-2',
    title: 'LuxeCart E-com',
    category: 'Ecommerce',
    image: 'https://picsum.photos/id/201/800/600',
    description: 'A high-end fashion e-commerce store with AR try-on capabilities and fast checkout.',
    impact: '2.5x conversion rate improvement',
    techStack: ['Shopify Plus', 'Three.js', 'Tailwind', 'Node.js'],
    client: 'LuxeCart Fashion',
    duration: '2 Months',
    challenge: 'High cart abandonment rates on mobile devices and a lack of trust in product quality from online visitors were stifling growth.',
    solution: 'We developed a headless Shopify store with a focus on mobile-first speed. We integrated a Three.js AR viewer allowing customers to see products in 3D space.',
    // Set mandatory status property for portfolio projects
    status: 'completed',
    // Added mandatory is_portfolio property for public listing
    is_portfolio: true,
    results: [
      'Conversion rate jumped from 1.2% to 3.1%.',
      'Mobile load time decreased from 4.5s to 0.9s.',
      'Average Order Value (AOV) increased by 20%.'
    ]
  },
  {
    id: 'proj-3',
    title: 'AutoCRM Bot',
    category: 'AI Automation',
    image: 'https://picsum.photos/id/3/800/600',
    description: 'An automated CRM agent that qualifies leads via WhatsApp and schedules meetings.',
    impact: 'Saved 20hrs/week of manual work',
    techStack: ['Node.js', 'OpenAI API', 'Twilio', 'HubSpot'],
    client: 'Global Sales Corp',
    duration: '4 Weeks',
    challenge: 'The sales team was spending 60% of their day responding to unqualified leads on WhatsApp, leading to burnout and missed high-value opportunities.',
    solution: 'We built a custom AI agent using OpenAI API connected to Twilio. The bot engages incoming leads, asks qualifying questions, and only forwards "Hot" leads to the HubSpot CRM.',
    // Set mandatory status property for portfolio projects
    status: 'completed',
    // Added mandatory is_portfolio property for public listing
    is_portfolio: true,
    results: [
      'Sales team saved 20 hours per week per rep.',
      'Response time dropped from 2 hours to 5 seconds.',
      'Lead qualification accuracy reached 94%.'
    ]
  },
  {
    id: 'proj-4',
    title: 'Urban Realty',
    category: 'Web & Branding',
    image: 'https://picsum.photos/id/435/800/600',
    description: 'Complete digital rebrand and property listing portal for a major real estate firm.',
    impact: '150% increase in inquiries',
    techStack: ['Next.js', 'Supabase', 'Framer Motion', 'Vercel'],
    client: 'Urban Realty Group',
    duration: '4 Months',
    challenge: 'A legacy website with poor SEO and broken search filters was causing Urban Realty to lose market share to tech-savvy competitors.',
    solution: 'We executed a complete rebrand and built a blazing fast Next.js property portal. We implemented advanced map search and automated email alerts for new listings.',
    // Set mandatory status property for portfolio projects
    status: 'completed',
    // Added mandatory is_portfolio property for public listing
    is_portfolio: true,
    results: [
      'Organic traffic increased by 200% in 6 months.',
      'Property inquiries rose by 150%.',
      'Reduced server costs by migrating to serverless architecture.'
    ]
  }
];

export const PRICING: PricingTier[] = [
  {
    name: 'Starter',
    price: '$999',
    description: 'Perfect for small businesses needing a professional presence.',
    features: ['5-Page Responsive Website', 'Basic SEO Setup', 'Contact Form Integration', '1 Month Support']
  },
  {
    name: 'Growth',
    price: '$2,499',
    description: 'For businesses ready to scale with automation and better design.',
    features: ['10-Page Custom Website', 'CMS Integration', 'Basic AI Chatbot', 'WhatsApp Integration', 'Google Analytics'],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Full-scale digital transformation and custom AI solutions.',
    features: ['Custom Web Application', 'Advanced AI Agents', 'Full CRM Automation', 'Priority 24/7 Support', 'Dedicated Manager']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'CEO',
    company: 'TechStart Inc.',
    content: 'HyperBuild Labs completely transformed our digital presence. The AI chatbot they implemented has cut our support ticket volume by half.',
    avatar: 'https://picsum.photos/id/64/100/100'
  },
  {
    id: 't2',
    name: 'Michael Chen',
    role: 'Founder',
    company: 'GreenLife Retail',
    content: 'Professional, fast, and incredibly knowledgeable. Their e-commerce solution helped us scale to 6-figures in just 3 months.',
    avatar: 'https://picsum.photos/id/91/100/100'
  },
  {
    id: 't3',
    name: 'Elena Rodriguez',
    role: 'Marketing Director',
    company: 'Urban Est',
    content: 'The automation workflows they built saved my team hours of manual data entry every single day. Worth every penny.',
    avatar: 'https://picsum.photos/id/338/100/100'
  }
];

export const FAQS: FaqItem[] = [
  {
    question: "How long does a typical website project take?",
    answer: "A standard business website typically takes 2-3 weeks from design to launch. More complex custom applications or e-commerce stores can take 4-6 weeks."
  },
  {
    question: "Do you offer ongoing support?",
    answer: "Yes, we offer monthly maintenance packages that include server monitoring, content updates, and priority technical support."
  },
  {
    question: "What is included in the AI Chatbot service?",
    answer: "Our AI Chatbot service includes training a model on your specific business data, integrating it into your website/WhatsApp, and setting up lead capture workflows."
  },
  {
    question: "Can I update the website myself?",
    answer: "Absolutely. We build most websites with a user-friendly CMS (Content Management System) so you can easily edit text and images without coding."
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ai-agents-2024',
    title: 'Why 2024 is the Year of the AI Agent',
    excerpt: 'Static chatbots are dead. Discover how autonomous AI agents are reshaping customer service, lead generation, and internal workflows for enterprise businesses.',
    category: 'AI Trends',
    author: 'Veeru',
    date: 'Oct 12, 2024',
    readTime: '5 min read',
    image: 'https://picsum.photos/id/3/800/400',
    tags: ['AI Agents', 'Customer Service', 'Automation', 'LLMs'],
    content: `
      <p>The era of "Sorry, I didn't get that" is over. We are entering the age of the Autonomous Agent.</p>
      <h3>What changed?</h3>
      <p>Until recently, chatbots were decision trees. They followed a script. If the user deviated, the bot broke. Large Language Models (LLMs) like Gemini and GPT-4 have fundamentally changed this architecture.</p>
      <p>Today's AI agents have:</p>
      <ul>
        <li><strong>Contextual Awareness:</strong> They remember previous conversations.</li>
        <li><strong>Tool Use:</strong> They can access your calendar, CRM, and inventory systems to perform actions.</li>
        <li><strong>Reasoning:</strong> They can "think" before they speak.</li>
      </ul>
      <h3>The Enterprise Advantage</h3>
      <p>For businesses, this means your "Support Bot" can now become a "Sales Associate". It can qualify leads, schedule meetings, and even process refunds—all without human intervention.</p>
      <p>At HyperBuild Labs, we are helping clients transition from static scripts to dynamic agents that drive real revenue.</p>
    `
  },
  {
    id: 'website-speed-optimization',
    title: 'The Hidden Cost of Slow Websites',
    excerpt: 'A 1-second delay in page load can result in a 7% reduction in conversions. Here is the technical breakdown of how we optimize Next.js for speed.',
    category: 'Web Development',
    author: 'Dev Team',
    date: 'Sep 28, 2024',
    readTime: '7 min read',
    image: 'https://picsum.photos/id/180/800/400',
    tags: ['Web Performance', 'Next.js', 'SEO', 'React'],
    content: `
      <p>We've all been there. You click a link, stare at a white screen for 3 seconds, and hit the back button. As a business owner, that "back button" is costing you thousands.</p>
      <h3>The Metrics That Matter</h3>
      <p>Google's Core Web Vitals are now a ranking factor. Specifically:</p>
      <ul>
        <li><strong>LCP (Largest Contentful Paint):</strong> How fast the main content loads.</li>
        <li><strong>CLS (Cumulative Layout Shift):</strong> Visual stability.</li>
      </ul>
      <h3>Our Approach</h3>
      <p>At HyperBuild, we build exclusively with Next.js and React. This allows us to leverage Server-Side Rendering (SSR) and Static Site Generation (SSG).</p>
      <p>This ensures that your HTML is pre-rendered on the server, delivered instantly via CDN, and then hydrated on the client. The result? Near-instant load times and higher conversion rates.</p>
    `
  },
  {
    id: 'nocode-vs-custom',
    title: 'No-Code vs Custom Dev: What Enterprise Needs',
    excerpt: 'Webflow is great, but it has limits. Learn when to use no-code tools and when to invest in a custom React application for your business infrastructure.',
    category: 'Strategy',
    author: 'Veeru',
    date: 'Sep 15, 2024',
    readTime: '6 min read',
    image: 'https://picsum.photos/id/60/800/400',
    tags: ['Strategy', 'No-Code', 'Scalability', 'Enterprise'],
    content: `
      <p>The "No-Code" movement is fantastic for MVPs. But when you hit scale, you hit walls.</p>
      <h3>The Ceiling of No-Code</h3>
      <p>Platforms like Wix or Webflow are constrained by their own architecture. You can't easily:</p>
      <ul>
        <li>Integrate complex proprietary databases.</li>
        <li>Build custom AI workflows.</li>
        <li>Optimize deeply for specific performance metrics.</li>
      </ul>
      <h3>When to Go Custom</h3>
      <p>If your digital platform is your <strong>product</strong>, you must own the code. Custom development (React, Node, Python) gives you IP ownership, infinite scalability, and zero vendor lock-in.</p>
    `
  }
];
