import { create } from 'zustand';
import { User } from 'firebase/auth';
import { 
  createAccount, 
  signIn, 
  signInWithGoogle, 
  signOut, 
  onAuthChange,
  resetPassword
} from '../services/firebase/auth';
import { db } from '../services/firebase/config';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface SecurityQuestion {
  question: string;
  answer: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasAcceptedTerms: boolean;
  createAccount: (email: string, password: string, securityQuestion: SecurityQuestion) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setHasAcceptedTerms: (accepted: boolean) => void;
  clearError: () => void;
  resetPasswordWithSecurityQuestion: (email: string, securityAnswer: string) => Promise<void>;
  verifySecurityQuestion: (email: string, answer: string) => Promise<boolean>;
  getSecurityQuestion: (email: string) => Promise<string | null>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,
  hasAcceptedTerms: false,

  createAccount: async (email: string, password: string, securityQuestion: SecurityQuestion) => {
    try {
      set({ isLoading: true, error: null });
      const user = await createAccount(email, password);
      
      // Store security question in Firestore
      await setDoc(doc(db, 'userSecurity', user.uid), {
        securityQuestion: securityQuestion.question,
        securityAnswer: securityQuestion.answer.toLowerCase(),
        email: email.toLowerCase()
      });
      
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      await signIn(email, password);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      await signInWithGoogle();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      await signOut();
      set({ user: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setHasAcceptedTerms: (accepted: boolean) => {
    set({ hasAcceptedTerms: accepted });
  },

  clearError: () => set({ error: null }),

  getSecurityQuestion: async (email: string) => {
    try {
      const q = query(
        collection(db, 'userSecurity'),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userData = querySnapshot.docs[0].data();
      return userData.securityQuestion;
    } catch (error) {
      console.error('Error getting security question:', error);
      return null;
    }
  },

  verifySecurityQuestion: async (email: string, answer: string) => {
    try {
      const q = query(
        collection(db, 'userSecurity'),
        where('email', '==', email.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const userData = querySnapshot.docs[0].data();
      return userData.securityAnswer === answer.toLowerCase();
    } catch (error) {
      console.error('Error verifying security question:', error);
      return false;
    }
  },

  resetPasswordWithSecurityQuestion: async (email: string, securityAnswer: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First verify the security question
      const isAnswerCorrect = await useAuthStore.getState().verifySecurityQuestion(email, securityAnswer);
      
      if (!isAnswerCorrect) {
        throw new Error('Incorrect security answer');
      }

      // If security question is correct, send password reset email
      await resetPassword(email);
      
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Initialize auth state listener
onAuthChange((user) => {
  useAuthStore.setState({ user, isLoading: false });
});