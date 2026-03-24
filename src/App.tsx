import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, User, collection, query, where, orderBy, onSnapshot, setDoc, doc, Timestamp, deleteDoc, updateDoc } from './firebase';
import { TravelPlan } from './types';
import { generateTravelPlan, refineTravelPlan } from './services/gemini';
import { Auth } from './components/Auth';
import { TravelForm } from './components/TravelForm';
import { TravelPlanDisplay } from './components/TravelPlanDisplay';
import { History } from './components/History';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sparkles, Map, History as HistoryIcon, Plus, Compass, Home, Search, Menu, X, Bell, ChevronDown, LayoutGrid, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [savedPlans, setSavedPlans] = useState<TravelPlan[]>([]);
  const [view, setView] = useState<'plan' | 'history'>('plan');
  const [lastParams, setLastParams] = useState<any>(null);
  const [showApp, setShowApp] = useState(false);
  const [initialDestination, setInitialDestination] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setSavedPlans([]);
      return;
    }

    const q = query(
      collection(db, 'travelPlans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TravelPlan[];
      setSavedPlans(plans);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGenerate = async (params: any) => {
    setIsLoading(true);
    setCurrentPlan(null);
    setLastParams(params);
    try {
      const plan = await generateTravelPlan(params);
      setCurrentPlan(plan);
      setView('plan');
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !currentPlan || !lastParams) return;

    const newPlan: Omit<TravelPlan, 'id'> = {
      userId: user.uid,
      destination: lastParams.destination || "Suggested Trip",
      duration: lastParams.duration,
      budget: lastParams.budget,
      style: lastParams.style,
      plan: currentPlan,
      createdAt: Timestamp.now()
    };

    try {
      // Use Firestore's auto-ID generation
      const docRef = doc(collection(db, 'travelPlans'));
      await setDoc(docRef, newPlan);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'travelPlans', id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    try {
      await updateDoc(doc(db, 'travelPlans', id), { isArchived });
    } catch (error) {
      console.error("Archive failed:", error);
    }
  };

  const handleRefine = async (request: string) => {
    if (!currentPlan) return;
    setIsRefining(true);
    try {
      const updatedPlan = await refineTravelPlan(currentPlan, request);
      setCurrentPlan(updatedPlan);
    } catch (error) {
      console.error("Refinement failed:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleSelectHistory = (plan: TravelPlan) => {
    setCurrentPlan(plan.plan);
    setLastParams({
      destination: plan.destination,
      duration: plan.duration,
      budget: plan.budget,
      style: plan.style
    });
    setView('plan');
    setShowApp(true);
  };

  const handleStartPlanning = (destination: string) => {
    setInitialDestination(destination);
    setShowApp(true);
    setView('plan');
    setCurrentPlan(null);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Trigger AI planning with defaults
    handleGenerate({
      destination: searchQuery,
      duration: '3 days',
      budget: 'mid',
      style: 'Aesthetic & Chill'
    });
    
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowApp(true);
    setView('plan');
  };

  const Header = () => (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => {
              setShowApp(false);
              setIsMenuOpen(false);
              setIsSearchOpen(false);
            }}
          >
            <div className="w-8 h-8 bg-olive rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-display font-bold tracking-tight text-ink group-hover:text-olive transition-colors">Alex Journly</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* AI Quick Menu (Logged in) */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 p-1.5 text-ink/60 hover:text-olive transition-colors bg-ink/5 rounded-lg"
                >
                  <LayoutGrid className="w-5 h-5" />
                  <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-ink/5 z-50 overflow-hidden"
                      >
                        <div className="p-2 space-y-1">
                          <button 
                            onClick={() => {
                              setView('plan');
                              setShowApp(true);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 text-sm font-medium text-ink hover:bg-olive/5 hover:text-olive rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 bg-olive/10 rounded-lg flex items-center justify-center group-hover:bg-olive group-hover:text-white transition-colors">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            Ask Journly AI
                          </button>

                          <div className="h-px bg-ink/5 my-1" />

                          <button 
                            onClick={() => {
                              setShowApp(false);
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 text-sm font-medium text-ink hover:bg-olive/5 hover:text-olive rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 bg-ink/5 rounded-lg flex items-center justify-center group-hover:bg-olive group-hover:text-white transition-colors">
                              <Compass className="w-4 h-4" />
                            </div>
                            My Alex Journly homepage
                          </button>

                          <button 
                            onClick={() => {
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 text-sm font-medium text-ink hover:bg-olive/5 hover:text-olive rounded-xl transition-all group"
                          >
                            <div className="w-8 h-8 bg-ink/5 rounded-lg flex items-center justify-center group-hover:bg-olive group-hover:text-white transition-colors">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                              Notifications
                              <span className="w-2 h-2 bg-olive rounded-full" />
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-ink/60 hover:text-olive transition-colors"
              title="Search"
            >
              {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <div className="hidden sm:block">
              <Auth user={user} />
            </div>
            
            {/* Mobile Sign In (Minimal) */}
            <div className="sm:hidden">
              <Auth user={user} minimal />
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 text-ink/60 hover:text-olive transition-colors"
              title="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Box Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border-b border-ink/5 overflow-hidden shadow-xl"
            >
              <div className="max-w-3xl mx-auto px-6 py-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/20" />
                  <input 
                    type="text"
                    autoFocus
                    placeholder="Where to? (e.g. Paris, Tokyo...)"
                    className="w-full bg-ink/5 border-none rounded-2xl py-4 pl-12 pr-6 text-lg focus:ring-2 focus:ring-olive/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-olive text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-olive/90 transition-all"
                  >
                    Plan
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay - OUTSIDE header tag */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop to ensure solid feel and click-to-close */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-80 bg-white z-[61] p-8 flex flex-col shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.3)]"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xl font-display font-bold text-olive">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-ink/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-ink/40" />
                </button>
              </div>

              <nav className="space-y-6 flex-1">
                {[
                  { label: 'Home', icon: Home, action: () => { setShowApp(false); setIsMenuOpen(false); } },
                  { label: 'Plan a Trip', icon: Plus, action: () => { setShowApp(true); setView('plan'); setIsMenuOpen(false); } },
                  { label: 'My Journal', icon: HistoryIcon, action: () => { setShowApp(true); setView('history'); setIsMenuOpen(false); } },
                  { label: 'Explore', icon: Compass, action: () => { setShowApp(false); setIsMenuOpen(false); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 text-2xl font-display font-bold text-ink hover:text-olive transition-colors group"
                  >
                    <div className="w-10 h-10 bg-ink/5 rounded-xl flex items-center justify-center group-hover:bg-olive/10 transition-colors">
                      <item.icon className="w-5 h-5 text-ink/40 group-hover:text-olive transition-colors" />
                    </div>
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="pt-8 border-t border-ink/5">
                <Auth user={user} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  if (!showApp) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col pt-16">
          <Header />
          <LandingPage onStartPlanning={handleStartPlanning} />
          <footer className="bg-ink text-paper py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-olive" />
                <span className="text-xl font-display font-bold">Alex Journly</span>
              </div>
              <div className="flex gap-8 text-sm font-medium uppercase tracking-widest text-paper/40">
                <a href="#" className="hover:text-olive transition-colors">About</a>
                <a href="#" className="hover:text-olive transition-colors">Privacy</a>
                <a href="#" className="hover:text-olive transition-colors">Terms</a>
                <a href="#" className="hover:text-olive transition-colors">Contact</a>
              </div>
              <div className="text-xs text-paper/20 uppercase tracking-widest">
                &copy; 2026 Alex Journly. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </ErrorBoundary>
    );
  }

  const showSidebar = view === 'history' || (view === 'plan' && !currentPlan && !isLoading);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col pt-16">
        <Header />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
          {!user ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <h2 className="text-6xl font-display font-bold leading-tight">
                  Unlock your <span className="italic text-olive">full</span> potential.
                </h2>
                <p className="text-xl text-ink/60 font-serif italic">
                  Sign in to save your journeys and access advanced AI planning features.
                </p>
                <div className="pt-8 flex justify-center">
                  <Auth user={null} />
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* View Toggles */}
              <div className="max-w-md mx-auto flex p-1 bg-ink/5 rounded-2xl">
                <button 
                  onClick={() => {
                    setView('plan');
                    setCurrentPlan(null);
                    setInitialDestination('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${view === 'plan' ? 'bg-white text-olive shadow-sm' : 'text-ink/40 hover:text-ink/60'}`}
                >
                  <Plus className="w-4 h-4" />
                  New Trip
                </button>
                <button 
                  onClick={() => setView('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${view === 'history' ? 'bg-white text-olive shadow-sm' : 'text-ink/40 hover:text-ink/60'}`}
                >
                  <HistoryIcon className="w-4 h-4" />
                  Journal
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left Column: Controls (Conditional) */}
                {showSidebar && (
                  <div className="lg:col-span-4 space-y-8">
                    <AnimatePresence mode="wait">
                      {view === 'plan' ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <TravelForm 
                            onSubmit={handleGenerate} 
                            isLoading={isLoading} 
                            initialDestination={initialDestination}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="history"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <History 
                            plans={savedPlans} 
                            onSelect={handleSelectHistory} 
                            onDelete={handleDelete}
                            onArchive={handleArchive}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Right Column: Display */}
                <div className={showSidebar ? "lg:col-span-8" : "lg:col-span-12"}>
                  <AnimatePresence mode="wait">
                    {currentPlan ? (
                      <TravelPlanDisplay 
                        key="display"
                        plan={currentPlan} 
                        onSave={handleSave}
                        isSaved={savedPlans.some(p => p.plan === currentPlan)}
                        onRefine={handleRefine}
                        isRefining={isRefining}
                      />
                    ) : !isLoading && (
                      <motion.div 
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-dashed border-ink/10"
                      >
                        <div className="w-20 h-20 bg-olive/5 rounded-full flex items-center justify-center text-olive/20 mb-6">
                          <Map className="w-10 h-10" />
                        </div>
                        <h3 className="text-3xl font-display font-bold text-ink/20 mb-4">Your journey starts here.</h3>
                        <p className="text-ink/30 font-serif italic max-w-xs">Fill out the form to generate a personalized travel itinerary.</p>
                      </motion.div>
                    )}
                    
                    {isLoading && (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-ink/5"
                      >
                        <div className="relative w-24 h-24 mb-8">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-4 border-olive/10 border-t-olive rounded-full"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-olive animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-display font-bold text-olive mb-4">Curating your escape...</h3>
                        <p className="text-ink/60 font-serif italic max-w-sm">We're finding the most aesthetic spots and hidden gems for your perfect trip.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-ink text-paper py-12 px-6 mt-20">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Compass className="w-6 h-6 text-olive" />
              <span className="text-xl font-display font-bold">Alex Journly</span>
            </div>
            <div className="flex gap-8 text-sm font-medium uppercase tracking-widest text-paper/40">
              <a href="#" className="hover:text-olive transition-colors">About</a>
              <a href="#" className="hover:text-olive transition-colors">Privacy</a>
              <a href="#" className="hover:text-olive transition-colors">Terms</a>
              <a href="#" className="hover:text-olive transition-colors">Contact</a>
            </div>
            <div className="text-xs text-paper/20 uppercase tracking-widest">
              &copy; 2026 Alex Journly. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
