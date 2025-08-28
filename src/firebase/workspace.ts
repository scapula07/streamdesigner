import { uploadFile } from './upload';
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

export const workspaceApi = {
  /**
   * Create a new workspace document in Firestore
   * @param userId - The user ID of the creator/owner
   * @param data - { name: string }
   */
  createWorkspace: async function (
    userId: string,
    data: { name: string; email?: string }
  ) {
    try {
      const now = new Date();
      const workspaceData = {
        name: data.name,
        dateCreated: now.toISOString(),
        creator: userId,
        members: [
          {
            userId,
            email: data.email || '',
            role: 'admin',
          },
        ],
      };
      const workspacesRef = collection(db, 'workspaces');
      const docRef = await addDoc(workspacesRef, workspaceData);
      return { id: docRef.id, ...workspaceData };
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  },
  /**
   * Fetch all workspaces for a user (where user is a member), ordered by dateCreated desc
   */
  getWorkspaces: async function (userId: string,email?:string) {
    try {
      const workspacesRef = collection(db, 'workspaces');
      const q = query(
        workspacesRef,
        where('creator', '==',userId),
        orderBy('dateCreated', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const workspaces = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return workspaces;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  },
  /**
   * Update a workspace document with new fields
   * @param workspaceId - The ID of the workspace to update
   * @param data - Fields to update (partial workspace fields)
   */
  /**
   * Update a workspace document with new fields (admin only)
   * @param workspaceId - The ID of the workspace to update
   * @param data - Fields to update (partial workspace fields)
   * @param userId - The ID of the user attempting the update
   */
  updateWorkspace: async function (
    workspaceId: string,
    data: Record<string, any>,
    userId: string
  ) {
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      const wsSnap = await getDoc(workspaceRef);
      if (!wsSnap.exists()) throw new Error('Workspace not found');
      const wsData = wsSnap.data();
      const isAdmin = Array.isArray(wsData.members) && wsData.members.some((m: any) => m.userId === userId && m.role === 'admin');
      if (!isAdmin) throw new Error('Only admin members can update this workspace');
      await updateDoc(workspaceRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  },
    getWorkspaceByID: async function (workspaceId: string) {
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      const docSnap = await getDoc(workspaceRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
      console.error('Error fetching workspace by ID:', error);
      throw error;
    }
  },

  /**
   * Upload an image and update the workspace with the logo/image URL
   * @param workspaceId - The ID of the workspace to update
   * @param file - The image file to upload
   * @returns The updated workspace object
   */
  updateWorkspaceLogo: async function (workspaceId: string, file: File) {
    try {
      // Upload the file to storage
      const imageUrl = await uploadFile(file);
      // Update the workspace document with the logo/image URL
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      await updateDoc(workspaceRef, { logo: imageUrl });
      // Return the updated workspace
      const updatedDoc = await getDoc(workspaceRef);
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating workspace logo:', error);
      throw error;
    }
  },

  /**
   * Delete a workspace by its ID
   * @param workspaceId - The ID of the workspace to delete
   */
  /**
   * Delete a workspace by its ID (admin only)
   * @param workspaceId - The ID of the workspace to delete
   * @param userId - The ID of the user attempting the delete
   */
  deleteWorkspace: async function (workspaceId: string, userId: string) {
    try {
      const workspaceRef = doc(db, 'workspaces', workspaceId);
      const wsSnap = await getDoc(workspaceRef);
      if (!wsSnap.exists()) throw new Error('Workspace not found');
      const wsData = wsSnap.data();
      const isAdmin = Array.isArray(wsData.members) && wsData.members.some((m: any) => m.userId === userId && m.role === 'admin');
      if (!isAdmin) throw new Error('Only admin members can delete this workspace');
      await deleteDoc(workspaceRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  },
};