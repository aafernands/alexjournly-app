import React, { useState } from 'react';
import { TravelPlan } from '../types';
import { MapPin, Calendar, Clock, ChevronRight, Trash2, Archive, ArchiveRestore, Eye, EyeOff, Search, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryProps {
  plans: TravelPlan[];
  onSelect: (plan: TravelPlan) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, isArchived: boolean) => void;
}

export function History({ plans, onSelect, onDelete, onArchive }: HistoryProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [planToDelete, setPlanToDelete] = useState<TravelPlan | null>(null);

  const filteredPlans = plans.filter(plan => {
    const matchesArchive = showArchived ? plan.isArchived : !plan.isArchived;
    const matchesSearch = plan.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesArchive && matchesSearch;
  });

  const archivedCount = plans.filter(plan => plan.isArchived).length;

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-ink/5 rounded-3xl border border-dashed border-ink/20">
        <p className="text-ink/40 font-display italic text-lg">Your travel journal is empty. Start planning your next adventure!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-olive">Your Saved Journeys</h2>
        {archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all bg-ink/5 text-ink/40 hover:bg-ink/10 hover:text-olive"
          >
            {showArchived ? (
              <><Eye className="w-3 h-3" /> Show Active</>
            ) : (
              <><Archive className="w-3 h-3" /> Show Archived ({archivedCount})</>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
          <input
            type="text"
            placeholder="Search destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-ink/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive/40 transition-all text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-ink/5 rounded-full text-ink/30 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPlans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-6 bg-ink/5 rounded-3xl border border-dashed border-ink/20"
            >
              <p className="text-ink/40 font-display italic">No {showArchived ? 'archived' : 'active'} journeys found.</p>
            </motion.div>
          ) : (
            filteredPlans.map((plan, index) => (
              <div key={plan.id} className="relative overflow-hidden rounded-2xl">
                {/* Action Backgrounds */}
                <div className="absolute inset-0 flex items-center justify-between px-6">
                  <div className="flex items-center gap-3 text-olive font-bold uppercase tracking-widest text-xs">
                    <Archive className="w-5 h-5" />
                    {plan.isArchived ? 'Restore' : 'Archive'}
                  </div>
                  <div className="flex items-center gap-3 text-red-500 font-bold uppercase tracking-widest text-xs">
                    Delete
                    <Trash2 className="w-5 h-5" />
                  </div>
                </div>

                <motion.div
                  layout
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 100) {
                      if (plan.id) onArchive(plan.id, !plan.isArchived);
                    } else if (info.offset.x < -100) {
                      setPlanToDelete(plan);
                    }
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative z-10 group bg-white p-5 rounded-2xl border border-ink/5 hover:border-olive/20 hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex items-center justify-between ${plan.isArchived ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  onClick={() => onSelect(plan)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-olive/10 rounded-xl flex items-center justify-center text-olive group-hover:bg-olive group-hover:text-white transition-all">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{plan.destination}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink/40 font-medium uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {plan.duration}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(plan.createdAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (plan.id) onArchive(plan.id, !plan.isArchived);
                        }}
                        className="p-2 text-ink/20 hover:text-olive hover:bg-olive/5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title={plan.isArchived ? "Restore from archive" : "Archive journey"}
                      >
                        {plan.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlanToDelete(plan);
                        }}
                        className="p-2 text-ink/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Delete journey"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink/20 group-hover:text-olive transition-all" />
                  </div>
                </motion.div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {planToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPlanToDelete(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-ink/5"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mb-6">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold text-ink mb-2">Delete Journey?</h3>
                <p className="text-ink/50 font-medium mb-8">
                  Are you sure you want to delete your trip to <span className="text-ink font-bold">{planToDelete.destination}</span>? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setPlanToDelete(null)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-ink/5 text-ink/40 hover:bg-ink/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (planToDelete.id) onDelete(planToDelete.id);
                      setPlanToDelete(null);
                    }}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
