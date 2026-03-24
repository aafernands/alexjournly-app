export interface TravelPlan {
  id?: string;
  userId: string;
  destination: string;
  duration: string;
  budget: 'low' | 'mid' | 'high';
  style: string;
  plan: string;
  createdAt: any;
  isArchived?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: any;
}
