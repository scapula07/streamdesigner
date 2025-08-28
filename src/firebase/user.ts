import { auth, db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  where,
  or,
  query,
  orderBy,
} from "firebase/firestore";
import {getStorage, ref, uploadBytes } from "firebase/storage"

export const userApi = {
  updateUserInfo: async function (userId: string, data: Record<string, any>) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, data);
      return { success: true, message: 'User information updated successfully!' };
    } catch (error) {
      console.error('Error updating user information:', error);
      return { success: false, message: 'Failed to update user information. Please try again.' };
    }
  },

  deleteUserAccount: async function (userId: string) {
    try {
      // Delete user document from Firestore
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // Delete user from Firebase Authentication
      const user = auth.currentUser;
      if (user && user.uid === userId) {
        await user.delete();
        return { success: true, message: 'User account deleted from Firestore and Authentication.' };
      } else {
        // If not current user, must use Admin SDK (not possible from client)
        return { success: false, message: 'Can only delete the currently authenticated user from Authentication on the client.' };
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
      return { success: false, message: 'Failed to delete user account. Please try again.' };
    }
  }
}