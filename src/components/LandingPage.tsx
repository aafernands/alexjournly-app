import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, ArrowRight, CheckCircle2, Star, ShieldCheck, Zap, Globe, MapPin, Heart, Sparkles, Camera, Utensils, Hotel, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onStartPlanning: (destination: string) => void;
}

export function LandingPage({ onStartPlanning }: LandingPageProps) {
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination.trim()) {
      onStartPlanning(destination);
    }
  };

  const babySteps = [
    { step: 1, title: 'Pick Your Vibe', desc: 'Decide if you want a relaxing beach escape or a bustling city adventure.', icon: Sparkles },
    { step: 2, title: 'Set Your Budget', desc: 'Define your spending limit so you can plan without financial stress.', icon: Wallet },
    { step: 3, title: 'Find Hidden Gems', desc: 'Use our AI to discover spots that aren\'t in the usual guidebooks.', icon: MapPin },
    { step: 4, title: 'Book Your Stay', desc: 'Secure the perfect aesthetic accommodation for your trip.', icon: Hotel },
    { step: 5, title: 'Pack Your Bags', desc: 'Get your essentials ready for the journey ahead.', icon: Zap },
    { step: 6, title: 'Go Explore', desc: 'Follow your curated itinerary and immerse yourself in the culture.', icon: Globe },
    { step: 7, title: 'Share Your Story', desc: 'Capture the moments and inspire others with your journey.', icon: Camera },
  ];

  const blogPosts = [
    {
      title: 'How to Travel Sustainably and Responsibly',
      desc: 'Learn how to minimize your footprint while maximizing your experience.',
      image: 'https://picsum.photos/seed/sustainable/600/400',
      tag: 'Eco-Travel'
    },
    {
      title: 'The Ultimate Insider’s Guide to U.S. Ski Destinations',
      desc: 'From Aspen to Tahoe, find the best slopes for your winter getaway.',
      image: 'https://picsum.photos/seed/ski/600/400',
      tag: 'Winter'
    },
    {
      title: 'Top 10 Must-Visit Cities in Europe',
      desc: 'Discover the charm and history of Europe\'s most iconic urban centers.',
      image: 'https://picsum.photos/seed/europe/600/400',
      tag: 'Urban'
    }
  ];

  const pros = [
    { name: 'Alex Fernandes', role: 'Lead Curator', bio: 'Travel enthusiast and AI expert dedicated to finding the world\'s most aesthetic spots.', image: 'https://picsum.photos/seed/alex/200/200' },
    { name: 'Sarah Jenkins', role: 'Eco-Travel Expert', bio: 'Specializes in sustainable journeys and responsible tourism across the globe.', image: 'https://picsum.photos/seed/sarah/200/200' },
    { name: 'Michael Chen', role: 'Culinary Guide', bio: 'A food lover who finds the best local eateries and hidden culinary gems.', image: 'https://picsum.photos/seed/michael/200/200' }
  ];

  return (
    <div className="bg-white text-ink font-sans overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/travel-hero/1920/1080?blur=2" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-olive/10 text-olive rounded-full text-sm font-bold uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" />
              The Proven Plan for Travel
            </div>
            <h1 className="text-5xl sm:text-7xl font-display font-bold leading-tight tracking-tight text-ink">
              Plan Your Next <span className="text-olive italic">Aesthetic</span> Journey with Confidence.
            </h1>
            <p className="text-xl sm:text-2xl text-ink/60 font-serif italic max-w-3xl mx-auto">
              Join thousands of travelers who have transformed their trips using our curated, AI-powered planning system.
            </p>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pt-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-olive/20 to-olive/10 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-[2rem] shadow-2xl border border-ink/5">
                  <div className="flex-1 flex items-center px-6 py-4">
                    <MapPin className="w-6 h-6 text-olive/40 mr-4" />
                    <input 
                      type="text" 
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where do you want to go?" 
                      className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-ink/20"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-olive text-white px-10 py-5 rounded-[1.5rem] font-bold text-lg hover:bg-olive/90 transition-all shadow-lg shadow-olive/20 flex items-center justify-center gap-2"
                  >
                    Start Planning
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="mt-6 text-sm text-ink/40 font-medium uppercase tracking-widest">
                No credit card required • Free AI Planning • Curated Results
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* The Proven Plan Section */}
      <section className="py-32 px-6 bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-olive/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive/5 rounded-full -ml-48 -mb-48 blur-[100px]" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">The Proven Plan That Works</h2>
            <p className="text-xl text-white/60 font-serif italic max-w-2xl mx-auto">
              Follow these 7 simple steps to go from "where should we go?" to "that was the best trip ever."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {babySteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-olive rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-olive/20 group-hover:scale-110 transition-transform">
                  {step.step}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 flex items-center gap-3">
                  <step.icon className="w-6 h-6 text-olive" />
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
            <div className="bg-olive p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-olive/20">
              <Heart className="w-16 h-16 text-white mb-6 animate-pulse" />
              <h3 className="text-2xl font-display font-bold mb-4">Ready to Start?</h3>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white text-olive px-8 py-4 rounded-xl font-bold hover:bg-paper transition-all"
              >
                Go to Step 1
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Small Steps Section (Blog Content) */}
      <section className="py-32 px-6 bg-paper">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">Small Steps That Lead to Big Wins</h2>
              <p className="text-xl text-ink/60 font-serif italic">
                Get the knowledge you need to travel smarter, cheaper, and more responsibly.
              </p>
            </div>
            <button className="text-olive font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              View All Posts <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {blogPosts.map((post, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-ink/5 group cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-olive">
                    {post.tag}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-olive transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-ink/60 font-medium leading-relaxed mb-6">
                    {post.desc}
                  </p>
                  <div className="flex items-center text-olive font-bold text-sm uppercase tracking-widest">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pros We Trust Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">Access to the Pros We Trust</h2>
            <p className="text-xl text-ink/60 font-serif italic max-w-2xl mx-auto">
              We only recommend experts who share our commitment to quality, aesthetics, and responsible travel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {pros.map((pro, i) => (
              <div key={i} className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 bg-olive/10 rounded-full blur-lg"></div>
                  <img 
                    src={pro.image} 
                    alt={pro.name} 
                    className="relative w-40 h-40 rounded-full object-cover mx-auto border-4 border-white shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold">{pro.name}</h3>
                  <p className="text-olive font-bold uppercase tracking-widest text-xs mt-1">{pro.role}</p>
                </div>
                <p className="text-ink/60 font-medium leading-relaxed italic">
                  "{pro.bio}"
                </p>
                <div className="flex justify-center gap-4">
                  <button className="p-2 bg-ink/5 rounded-full hover:bg-olive hover:text-white transition-all">
                    <Globe className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-ink/5 rounded-full hover:bg-olive hover:text-white transition-all">
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 bg-olive relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <h2 className="text-4xl sm:text-6xl font-display font-bold mb-8">Stop Dreaming. Start Journeying.</h2>
          <p className="text-xl sm:text-2xl text-white/80 font-serif italic mb-12">
            Your next aesthetic adventure is just a few clicks away. Join the millions who travel better with Alex Journly.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white text-olive px-12 py-6 rounded-[2rem] font-bold text-xl hover:bg-paper transition-all shadow-2xl flex items-center justify-center gap-3 mx-auto"
          >
            Plan Your Free Trip Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
}
