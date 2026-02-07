// ============================================================================
// Guest Mode Storage Utility
// Manages localStorage for guest users (no account required)
// ============================================================================

export interface GuestProfile {
  skin_type?: string;
  main_concern?: string; // Can be comma-separated for multiple concerns
  age_range?: string; // Now stores numeric age
  sun_exposure?: string;
  budget?: string;
  routine_complexity?: string;
  country?: string;
  climate?: string;
  approach_preference?: 'natural' | 'science';
  completed_at?: string;
}

export interface GuestPlan {
  id: string;
  created_at: string;
  routine_name: string;
  routine: any;
  summary?: string;
  overall_score?: number;
}

export interface GuestWishlistItem {
  id: string;
  product_name: string;
  brand?: string;
  tier?: 'best' | 'budget' | 'premium';
  category?: string;
  notes?: string;
  is_owned?: boolean;
  added_at: string;
}

const GUEST_PROFILE_KEY = 'dbn_guest_profile';
const GUEST_PLANS_KEY = 'dbn_guest_plans';
const GUEST_WISHLIST_KEY = 'dbn_guest_wishlist';
const IS_GUEST_KEY = 'dbn_is_guest';

export const guestStorage = {
  // Check if user is in guest mode
  isGuest(): boolean {
    return localStorage.getItem(IS_GUEST_KEY) === 'true';
  },

  // Set guest mode
  setGuestMode(isGuest: boolean): void {
    localStorage.setItem(IS_GUEST_KEY, isGuest.toString());
  },

  // Profile
  getProfile(): GuestProfile | null {
    const data = localStorage.getItem(GUEST_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveProfile(profile: GuestProfile): void {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify({
      ...profile,
      completed_at: new Date().toISOString(),
    }));
  },

  // Plans
  getPlans(): GuestPlan[] {
    const data = localStorage.getItem(GUEST_PLANS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getActivePlan(): GuestPlan | null {
    const plans = this.getPlans();
    return plans.length > 0 ? plans[0] : null;
  },

  savePlan(plan: Omit<GuestPlan, 'id' | 'created_at'>): GuestPlan {
    const plans = this.getPlans();
    const newPlan: GuestPlan = {
      ...plan,
      id: `guest_plan_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    // Keep only last 5 plans
    const updatedPlans = [newPlan, ...plans].slice(0, 5);
    localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify(updatedPlans));
    return newPlan;
  },

  // Wishlist
  getWishlist(): GuestWishlistItem[] {
    const data = localStorage.getItem(GUEST_WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  },

  addToWishlist(item: Omit<GuestWishlistItem, 'id' | 'added_at'>): void {
    const wishlist = this.getWishlist();
    const newItem: GuestWishlistItem = {
      ...item,
      id: `guest_wishlist_${Date.now()}`,
      added_at: new Date().toISOString(),
    };
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify([newItem, ...wishlist]));
  },

  removeFromWishlist(id: string): void {
    const wishlist = this.getWishlist();
    const updated = wishlist.filter(item => item.id !== id);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
  },

  updateWishlistItem(id: string, updates: Partial<GuestWishlistItem>): void {
    const wishlist = this.getWishlist();
    const updated = wishlist.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updated));
  },

  // Clear all guest data
  clearAll(): void {
    localStorage.removeItem(GUEST_PROFILE_KEY);
    localStorage.removeItem(GUEST_PLANS_KEY);
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    localStorage.removeItem(IS_GUEST_KEY);
  },

  // Get all data for migration
  getAllData(): {
    profile: GuestProfile | null;
    plans: GuestPlan[];
    wishlist: GuestWishlistItem[];
  } {
    return {
      profile: this.getProfile(),
      plans: this.getPlans(),
      wishlist: this.getWishlist(),
    };
  },
};
