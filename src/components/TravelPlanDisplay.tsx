import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Share2, Bookmark, Download, Link, Twitter, Facebook, MessageCircle, Check, Loader2, Send, MapPin, Hotel, Utensils, Camera, Sparkles, Wallet, Calendar, Info, Star, Clock, Globe, Compass, Map as MapIcon, Trash2, MapPin as MapPinIcon, Plus, CheckCircle2, Circle, ListTodo, Plane, Cloud, Shield, Briefcase, ExternalLink, FileText, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { GoogleGenAI, Type } from "@google/genai";
import { InteractiveMap, MapLocation } from './InteractiveMap';

interface TravelPlanDisplayProps {
  plan: string;
  onSave?: () => void;
  isSaved?: boolean;
  onRefine?: (request: string) => Promise<void>;
  isRefining?: boolean;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const MarkdownComponents = {
  h1: ({ children }: any) => {
    const title = String(children);
    return (
      <div className="mb-12">
        <div className="relative h-64 sm:h-80 w-full rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl group">
          <img 
            src={`https://source.unsplash.com/featured/1200x800?${encodeURIComponent(title)}`} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2 uppercase tracking-widest">
              <Globe className="w-4 h-4" />
              Your Curated Journey
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight">
              {children}
            </h1>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Calendar, label: 'Duration', value: 'Custom' },
            { icon: Wallet, label: 'Budget', value: 'Optimized' },
            { icon: Compass, label: 'Style', value: 'Bespoke' },
            { icon: Star, label: 'Rating', value: 'Top Tier' },
          ].map((stat, i) => (
            <div key={i} className="bg-olive/5 border border-olive/10 p-4 rounded-2xl flex flex-col items-center text-center group hover:bg-olive hover:text-white transition-all duration-300 cursor-pointer">
              <stat.icon className="w-5 h-5 mb-2 text-olive group-hover:text-white transition-colors" />
              <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">{stat.label}</span>
              <span className="text-sm font-bold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  h2: ({ children }: any) => {
    const text = String(children).toLowerCase();
    let icon = <Info className="w-6 h-6" />;
    
    if (text.includes('stay') || text.includes('accommodation')) icon = <Hotel className="w-6 h-6" />;
    if (text.includes('itinerary') || text.includes('day')) icon = <Calendar className="w-6 h-6" />;
    if (text.includes('attraction') || text.includes('see')) icon = <Camera className="w-6 h-6" />;
    if (text.includes('gem')) icon = <Sparkles className="w-6 h-6" />;
    if (text.includes('food') || text.includes('drink') || text.includes('eat')) icon = <Utensils className="w-6 h-6" />;
    if (text.includes('cost') || text.includes('budget')) icon = <Wallet className="w-6 h-6" />;

    const isDayHeader = text.includes('day');

    return (
      <h2 className={cn(
        "text-2xl font-display font-bold mt-16 mb-8 flex items-center gap-4 p-5 rounded-[2rem] transition-all",
        isDayHeader 
          ? "bg-olive text-white shadow-xl shadow-olive/20 -mx-4 sm:-mx-8" 
          : "bg-ink/5 text-ink border border-ink/5"
      )}>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
          isDayHeader ? "bg-white/20 text-white" : "bg-olive/10 text-olive"
        )}>
          {icon}
        </div>
        <div className="flex flex-col">
          {isDayHeader && <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold leading-none mb-1">Daily Plan</span>}
          <span>{children}</span>
        </div>
      </h2>
    );
  },
  h3: ({ children }: any) => (
    <h3 className="text-xl font-bold text-ink/90 mt-10 mb-5 flex items-center gap-3">
      <div className="w-1.5 h-6 bg-olive/30 rounded-full" />
      {children}
    </h3>
  ),
  p: ({ children }: any) => {
    const text = String(children);
    if (text.startsWith('Want me to adjust') || text.includes("integrated real images into your travel plans")) {
      return null;
    }
    return (
      <p className="text-ink/70 leading-relaxed mb-8 font-serif italic text-lg first-of-type:text-2xl first-of-type:text-olive/80 first-of-type:border-l-4 first-of-type:border-olive/20 first-of-type:pl-8 first-of-type:py-4 first-of-type:mb-12 first-of-type:not-italic first-of-type:font-display first-of-type:font-medium">
        {children}
      </p>
    );
  },
  ul: ({ children }: any) => (
    <ul className="grid grid-cols-1 gap-4 mb-12">
      {children}
    </ul>
  ),
  li: ({ children }: any) => {
    const [checked, setChecked] = useState(false);
    return (
      <li 
        onClick={() => setChecked(!checked)}
        className={cn(
          "bg-white border p-5 rounded-3xl flex items-start gap-4 shadow-sm transition-all duration-300 cursor-pointer group",
          checked ? "border-olive/40 bg-olive/[0.02] opacity-60" : "border-ink/5 hover:border-olive/20 hover:shadow-md"
        )}
      >
        <div className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300",
          checked ? "bg-olive text-white" : "bg-olive/10 text-olive group-hover:bg-olive group-hover:text-white"
        )}>
          {checked ? <Check className="w-4 h-4" /> : <Star className="w-3.5 h-3.5" />}
        </div>
        <span className={cn(
          "text-ink/80 font-medium leading-relaxed transition-all duration-300",
          checked && "line-through decoration-olive/30"
        )}>
          {children}
        </span>
      </li>
    );
  },
  strong: ({ children }: any) => (
    <strong className="font-bold text-olive bg-olive/10 px-1.5 py-0.5 rounded-md">
      {children}
    </strong>
  ),
  blockquote: ({ children }: any) => (
    <div className="bg-olive/5 border-l-8 border-olive p-8 rounded-r-[2rem] my-12 italic text-olive/80 font-serif text-xl relative overflow-hidden">
      <Sparkles className="absolute top-4 right-4 w-12 h-12 text-olive/5" />
      {children}
    </div>
  ),
  img: ({ src, alt }: any) => (
    <div className="my-12 relative group">
      <div className="absolute -inset-4 bg-olive/5 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl border border-ink/5">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {alt && (
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ink/80 to-transparent">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4 text-olive" />
              {alt}
            </p>
          </div>
        )}
      </div>
    </div>
  ),
};

export function TravelPlanDisplay({ plan, onSave, isSaved, onRefine, isRefining }: TravelPlanDisplayProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [refinementText, setRefinementText] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isExtractingLocations, setIsExtractingLocations] = useState(false);
  const [todoList, setTodoList] = useState<TodoItem[]>([
    { id: '1', text: 'Book return flights', completed: false },
    { id: '2', text: 'Confirm hotel reservations', completed: false },
    { id: '3', text: 'Check passport & visa requirements', completed: false },
    { id: '4', text: 'Purchase travel insurance', completed: false },
    { id: '5', text: 'Pack travel essentials', completed: false },
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['itinerary']);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{src: string, alt: string}[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract images from markdown
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const images: {src: string, alt: string}[] = [];
    let match;
    while ((match = imgRegex.exec(plan)) !== null) {
      images.push({ alt: match[1], src: match[2] });
    }
    setGalleryImages(images);
  }, [plan]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const extractLocations = async () => {
      if (!plan) return;
      setIsExtractingLocations(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Extract all key locations (attractions, hotels, restaurants) from this travel plan and provide their latitude and longitude. 
          Respond ONLY with a JSON array of objects with fields: name, lat, lng, type (one of: 'attraction', 'hotel', 'restaurant', 'other'), and description.
          
          Travel Plan:
          ${plan}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  type: { 
                    type: Type.STRING,
                    enum: ['attraction', 'hotel', 'restaurant', 'other']
                  },
                  description: { type: Type.STRING }
                },
                required: ['name', 'lat', 'lng', 'type']
              }
            }
          }
        });

        const extracted = JSON.parse(response.text || '[]');
        setLocations(extracted);
      } catch (error) {
        console.error('Error extracting locations:', error);
      } finally {
        setIsExtractingLocations(false);
      }
    };

    extractLocations();
  }, [plan]);

  const shareUrl = window.location.href;
  const shareText = "Check out my travel plan on Alex Journly!";

  const handleSave = () => {
    if (onSave) {
      onSave();
      if (!isSaved) {
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      }
    }
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim() || !onRefine || isRefining) return;
    
    await onRefine(refinementText);
    setRefinementText('');
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = contentRef.current;
      const opt = {
        margin: [15, 15] as [number, number],
        filename: 'Alex-Journly-Travel-Plan.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Alex Journly Travel Plan',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback for browsers that don't support native share
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    
    const newTodo: TodoItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newTodoText.trim(),
      completed: false
    };
    
    setTodoList([...todoList, newTodo]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodoList(todoList.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (id: string) => {
    setTodoList(todoList.filter(todo => todo.id !== id));
  };

  const addSuggestedTodo = (text: string) => {
    if (todoList.some(t => t.text.toLowerCase() === text.toLowerCase())) return;
    const newTodo: TodoItem = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      completed: false
    };
    setTodoList([...todoList, newTodo]);
  };

  const suggestedTasks = [
    "Book airport transfer",
    "Download offline maps",
    "Notify bank of travel",
    "Check weather forecast",
    "Buy local SIM/eSIM",
    "Pack power adapter"
  ];

  const travelResources = [
    { name: 'Google Flights', url: 'https://www.google.com/flights', icon: Plane, desc: 'Find the best flight deals' },
    { name: 'Booking.com', url: 'https://www.booking.com', icon: Hotel, desc: 'Secure your stay' },
    { name: 'Weather.com', url: 'https://weather.com', icon: Cloud, desc: 'Check the local forecast' },
    { name: 'Travel Insurance', url: 'https://www.worldnomads.com', icon: Shield, desc: 'Protect your journey' },
    { name: 'Visa Guide', url: 'https://visaguide.world', icon: FileText, desc: 'Check entry requirements' },
    { name: 'PackPoint', url: 'https://www.packpnt.com', icon: Briefcase, desc: 'Smart packing lists' },
  ];

  const shareOptions = [
    { 
      name: 'Copy Link', 
      icon: copied ? Check : Link, 
      action: handleCopyLink,
      color: copied ? 'text-green-600' : 'text-ink'
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: 'text-[#1DA1F2]'
    },
    { 
      name: 'Facebook', 
      icon: Facebook, 
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
      color: 'text-[#1877F2]'
    },
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank'),
      color: 'text-[#25D366]'
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FDFCFB] p-6 sm:p-16 rounded-[3rem] shadow-2xl border border-ink/5 relative overflow-hidden pb-32"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-olive/40 via-olive to-olive/40" />
      <div className="absolute top-20 right-0 w-[40rem] h-[40rem] bg-olive/[0.03] rounded-full -mr-80 -mt-80 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-[30rem] h-[30rem] bg-olive/[0.02] rounded-full -ml-60 blur-[80px] pointer-events-none" />
      
      {/* Floating Action Bar */}
      <div className="sticky top-6 z-30 flex justify-center mb-12">
        <div className="bg-white/80 backdrop-blur-xl border border-ink/5 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={handleShare}
              className={cn(
                "p-2.5 rounded-full transition-all",
                showShareMenu ? "text-olive bg-olive/10" : "text-ink/40 hover:text-olive hover:bg-olive/5"
              )}
              title="Share journey"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowShareMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 bg-white rounded-[2rem] shadow-2xl border border-ink/5 p-3 z-20"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {shareOptions.map((option) => (
                        <button
                          key={option.name}
                          onClick={() => {
                            option.action();
                            if (option.name !== 'Copy Link') setShowShareMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-2xl hover:bg-ink/5 transition-colors text-left"
                        >
                          <option.icon className={cn("w-4 h-4", option.color)} />
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-ink/10" />

          <button 
            className="p-2.5 rounded-full transition-all text-ink/40 hover:text-olive hover:bg-olive/5"
            onClick={() => {
              const refineSection = document.getElementById('refine-section');
              refineSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Jump to refinement"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button 
            onClick={handleSave}
            className={cn(
              "p-2.5 rounded-full transition-all relative",
              isSaved ? "text-olive bg-olive/10" : "text-ink/40 hover:text-olive hover:bg-olive/5"
            )}
            title={isSaved ? "Saved to history" : "Save to history"}
          >
            <motion.div
              animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
            </motion.div>
            
            <AnimatePresence>
              {showSavedToast && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -45, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-olive text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg pointer-events-none"
                >
                  Saved!
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button 
            className={cn(
              "p-2.5 rounded-full transition-all",
              isDownloading ? "text-olive bg-olive/10" : "text-ink/40 hover:text-olive hover:bg-olive/5"
            )}
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div ref={contentRef} className="relative z-10">
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('itinerary')}
            className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-ink">Itinerary Details</span>
            </div>
            {expandedSections.includes('itinerary') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
          </button>
          
          <AnimatePresence>
            {expandedSections.includes('itinerary') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 px-2">
                  <Markdown components={MarkdownComponents}>{plan}</Markdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Interactive Map Section Accordion */}
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('map')}
            className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                <MapIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-ink">Journey Map</span>
            </div>
            <div className="flex items-center gap-4">
              {isExtractingLocations && (
                <div className="flex items-center gap-2 text-olive animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Mapping...</span>
                </div>
              )}
              {expandedSections.includes('map') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
            </div>
          </button>

          <AnimatePresence>
            {expandedSections.includes('map') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8">
                  <InteractiveMap locations={locations} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trip Preparation To-Do List Accordion */}
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('prep')}
            className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                <ListTodo className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-ink">Trip Preparation</span>
            </div>
            {expandedSections.includes('prep') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
          </button>

          <AnimatePresence>
            {expandedSections.includes('prep') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8">
                  <div className="space-y-6">
                    <div className="bg-white border border-ink/5 rounded-[2.5rem] p-8 shadow-sm">
                      <form onSubmit={addTodo} className="flex gap-3 mb-8">
                        <input
                          type="text"
                          value={newTodoText}
                          onChange={(e) => setNewTodoText(e.target.value)}
                          placeholder="Add a custom task..."
                          className="flex-1 bg-ink/5 border-none rounded-2xl py-4 px-6 text-ink placeholder:text-ink/30 focus:ring-2 focus:ring-olive/20 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!newTodoText.trim()}
                          className="bg-olive text-white p-4 rounded-2xl hover:bg-olive/90 transition-all disabled:opacity-50 shadow-lg shadow-olive/10"
                        >
                          <Plus className="w-6 h-6" />
                        </button>
                      </form>

                      <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                          {todoList.length === 0 ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12 px-6 border-2 border-dashed border-ink/5 rounded-3xl"
                            >
                              <p className="text-ink/30 font-serif italic">No tasks added yet. What do you need to prepare?</p>
                            </motion.div>
                          ) : (
                            todoList.map((todo) => (
                              <motion.div
                                key={todo.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border transition-all group",
                                  todo.completed ? "bg-olive/[0.02] border-olive/10 opacity-60" : "bg-white border-ink/5 hover:border-olive/20 hover:shadow-md"
                                )}
                              >
                                <button
                                  onClick={() => toggleTodo(todo.id)}
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                    todo.completed ? "bg-olive text-white" : "bg-ink/5 text-ink/20 group-hover:text-olive group-hover:bg-olive/10"
                                  )}
                                >
                                  {todo.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                </button>
                                <span className={cn(
                                  "flex-1 font-medium transition-all",
                                  todo.completed ? "text-ink/40 line-through decoration-olive/30" : "text-ink/80"
                                )}>
                                  {todo.text}
                                </span>
                                <button
                                  onClick={() => removeTodo(todo.id)}
                                  className="p-2 text-ink/10 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))
                          )}
                        </AnimatePresence>
                      </div>

                      {todoList.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-ink/5 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-ink/30">
                          <span>{todoList.filter(t => t.completed).length} of {todoList.length} tasks completed</span>
                          <button 
                            onClick={() => setTodoList(todoList.filter(t => !t.completed))}
                            className="hover:text-olive transition-colors"
                          >
                            Clear Completed
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Suggested Tasks */}
                    <div className="bg-olive/5 rounded-[2.5rem] p-8">
                      <h5 className="text-sm font-bold uppercase tracking-widest text-olive/60 mb-6">Suggested for your trip</h5>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTasks.map((task) => (
                          <button
                            key={task}
                            onClick={() => addSuggestedTodo(task)}
                            className="px-4 py-2 bg-white border border-olive/10 rounded-full text-xs font-bold text-olive hover:bg-olive hover:text-white transition-all shadow-sm"
                          >
                            + {task}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Travel Resources Accordion */}
        <div className="mb-8">
          <button 
            onClick={() => toggleSection('resources')}
            className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-ink">Travel Resources</span>
            </div>
            {expandedSections.includes('resources') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
          </button>

          <AnimatePresence>
            {expandedSections.includes('resources') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8">
                  <div className="bg-ink text-paper rounded-[2.5rem] p-8 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {travelResources.map((resource) => (
                        <a
                          key={resource.name}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-4 group"
                        >
                          <div className="w-10 h-10 bg-paper/5 rounded-xl flex items-center justify-center text-paper/40 group-hover:bg-olive group-hover:text-white transition-all">
                            <resource.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1 font-bold text-sm group-hover:text-olive transition-colors">
                              {resource.name}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-xs opacity-40 font-serif italic">{resource.desc}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Travel Safe Accordion */}
        <div className="mb-12">
          <button 
            onClick={() => toggleSection('safe')}
            className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-ink">Travel Safe</span>
            </div>
            {expandedSections.includes('safe') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
          </button>

          <AnimatePresence>
            {expandedSections.includes('safe') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8">
                  <div className="bg-white border border-ink/5 rounded-[2.5rem] p-8 text-center">
                    <div className="w-12 h-12 bg-olive/10 rounded-full flex items-center justify-center text-olive mx-auto mb-4">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h6 className="font-display font-bold text-ink mb-2">Travel Safe</h6>
                    <p className="text-xs text-ink/50 font-serif italic mb-4">Always check the latest travel advisories for your destination.</p>
                    <a 
                      href="https://travel.state.gov" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-bold uppercase tracking-widest text-olive hover:underline"
                    >
                      Official Advisories
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gallery Accordion */}
        {galleryImages.length > 0 && (
          <div className="mb-12">
            <button 
              onClick={() => toggleSection('gallery')}
              className="w-full flex items-center justify-between p-6 bg-white border border-ink/5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-olive/10 rounded-xl flex items-center justify-center text-olive">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="text-xl font-display font-bold text-ink">Visual Gallery</span>
              </div>
              {expandedSections.includes('gallery') ? <ChevronUp className="w-5 h-5 text-ink/20" /> : <ChevronDown className="w-5 h-5 text-ink/20" />}
            </button>

            <AnimatePresence>
              {expandedSections.includes('gallery') && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {galleryImages.map((img, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                        >
                          <img 
                            src={img.src} 
                            alt={img.alt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{img.alt}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-32 right-8 z-50 w-12 h-12 bg-white border border-ink/5 rounded-full shadow-2xl flex items-center justify-center text-olive hover:bg-olive hover:text-white transition-all"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Refinement Chat Input - FIXED AT BOTTOM */}
      {onRefine && (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            <form onSubmit={handleRefineSubmit} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-olive/20 to-olive/10 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative">
                <input
                  type="text"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="Perfect your itinerary (e.g., 'Add more food stops')..."
                  disabled={isRefining}
                  className="w-full bg-white border border-ink/10 rounded-[2rem] py-5 pl-8 pr-20 text-ink placeholder:text-ink/30 shadow-2xl focus:ring-4 focus:ring-olive/10 focus:border-olive/30 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!refinementText.trim() || isRefining}
                  className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-olive text-white rounded-2xl hover:bg-olive/90 transition-all disabled:opacity-50 shadow-lg shadow-olive/20 flex items-center justify-center"
                >
                  {isRefining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
