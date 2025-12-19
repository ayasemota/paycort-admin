import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

type WaitlistData = { firstName: string; lastName: string; phone: string; email: string };
type UserData = { name: string; email: string; password: string };
type TaxData = { amount: number; category: string; description: string; date: string; status: "pending" | "paid" | "overdue" };

export const waitlistService = {
  add: async (data: WaitlistData) => {
    try {
      const docRef = await addDoc(collection(db, "paycortWaitlist"), { ...data, createdAt: serverTimestamp() });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      return { success: false, error };
    }
  },
  getAll: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "paycortWaitlist"));
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting waitlist:", error);
      return [];
    }
  },
  checkEmail: async (email: string) => {
    try {
      const q = query(collection(db, "paycortWaitlist"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  }
};

export const userService = {
  create: async (data: UserData) => {
    try {
      const docRef = await addDoc(collection(db, "users"), { ...data, createdAt: serverTimestamp(), role: "user", isActive: true });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creating user:", error);
      return { success: false, error };
    }
  },
  getByEmail: async (email: string) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },
  update: async (userId: string, data: Partial<UserData>) => {
    try {
      await updateDoc(doc(db, "users", userId), { ...data, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error };
    }
  },
  delete: async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, error };
    }
  }
};

export const taxService = {
  create: async (userId: string, taxData: TaxData) => {
    try {
      const docRef = await addDoc(collection(db, "taxes"), { ...taxData, userId, createdAt: serverTimestamp() });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error creating tax record:", error);
      return { success: false, error };
    }
  },
  getUserTaxes: async (userId: string) => {
    try {
      const q = query(collection(db, "taxes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting user taxes:", error);
      return [];
    }
  },
  update: async (taxId: string, taxData: Partial<TaxData>) => {
    try {
      await updateDoc(doc(db, "taxes", taxId), { ...taxData, updatedAt: serverTimestamp() });
      return { success: true };
    } catch (error) {
      console.error("Error updating tax record:", error);
      return { success: false, error };
    }
  },
  delete: async (taxId: string) => {
    try {
      await deleteDoc(doc(db, "taxes", taxId));
      return { success: true };
    } catch (error) {
      console.error("Error deleting tax record:", error);
      return { success: false, error };
    }
  }
};