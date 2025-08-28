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
import { getStorage, ref, uploadBytes } from "firebase/storage";

export const invitationApi = {
  /**
   * Create a new workspace document in Firestore
   * @param userId - The user ID of the creator/owner
   * @param data - { name: string }
   */
  /**
   * Create a new invitation document in Firestore
   * @param data - { email, workspaceId, inviterId, status, token, expiresAt }
   */
  createInvitation: async function (data: {
    email: string;
    workspaceId: string;
    inviterId: string;
    status?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    token?: string;
    expiresAt: string;
  }) {
    function generateToken(length = 32) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    try {
      const invitationData = {
        email: data.email,
        workspaceId: data.workspaceId,
        // inviterId: data.inviterId,
        status: data.status || 'PENDING',
        token: data.token || generateToken(),
        expiresAt: data.expiresAt,
      };
      const invitationsRef = collection(db, 'invitations');
      const docRef = await addDoc(invitationsRef, invitationData);
      await updateDoc(docRef, { id: docRef.id });
      return { id: docRef.id, ...invitationData };
    } catch (error) {
      console.error('Error creating invitation:', error);
      throw error;
    }
  },
}