import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { guestStorage } from '@/lib/guestStorage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  migrateGuestData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for guest mode on mount
    const guestMode = guestStorage.isGuest();
    setIsGuest(guestMode);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // If user logs in, turn off guest mode
        if (session?.user) {
          setIsGuest(false);
          guestStorage.setGuestMode(false);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // If user is logged in, turn off guest mode
      if (session?.user) {
        setIsGuest(false);
        guestStorage.setGuestMode(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();

    // If signing out, offer to continue as guest
    // (UI will handle this prompt)
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    guestStorage.setGuestMode(true);
    setLoading(false);
  };

  const migrateGuestData = async () => {
    if (!user) return;

    try {
      const guestData = guestStorage.getAllData();

      // Migrate profile data
      if (guestData.profile) {
        await supabase.from('profiles').upsert({
          id: user.id,
          skin_type: guestData.profile.skin_type,
          concerns: guestData.profile.main_concern ? [guestData.profile.main_concern] : [],
          age_range: guestData.profile.age_range,
          country: guestData.profile.country,
          climate: guestData.profile.climate as any,
          budget_tier: guestData.profile.budget as any,
        });
      }

      // Migrate wishlist
      if (guestData.wishlist.length > 0) {
        const wishlistItems = guestData.wishlist.map(item => ({
          user_id: user.id,
          product_name: item.product_name,
          brand: item.brand,
          category: item.category,
          is_currently_using: false,
          notes: item.notes,
        }));

        await supabase.from('user_products').insert(wishlistItems);
      }

      // Note: Plans will be regenerated with AI after migration
      // since the format doesn't match exactly

      // Clear guest data after successful migration
      guestStorage.clearAll();
      setIsGuest(false);

      console.log('Guest data migrated successfully');
    } catch (error) {
      console.error('Failed to migrate guest data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isGuest,
      signUp,
      signIn,
      signOut,
      continueAsGuest,
      migrateGuestData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
