import React from 'react';
import { auth, googleProvider, signInWithPopup, signOut, User, db, doc, setDoc, Timestamp } from '../firebase';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

export function Auth({ user, minimal = false }: { user: User | null, minimal?: boolean }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user profile
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: Timestamp.now()
      }, { merge: true });
      
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (user) {
    if (minimal) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden border border-olive/20">
          <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-olive/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-olive/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-olive" />
            </div>
          )}
          <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-olive hover:bg-olive/5 rounded-full transition-colors border border-olive/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    );
  }

  if (minimal) {
    return (
      <button 
        onClick={handleLogin}
        className="text-sm font-bold text-olive uppercase tracking-widest"
      >
        Sign In
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-olive text-white rounded-full hover:bg-olive-light transition-all shadow-sm"
    >
      <LogIn className="w-4 h-4" />
      <span>Sign in with Google</span>
    </button>
  );
}
