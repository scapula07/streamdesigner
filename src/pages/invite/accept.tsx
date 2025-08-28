
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc as firestoreDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const { token } = router.query;
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState<boolean | null>(null);
  const [invitationDocId, setInvitationDocId] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const checkToken = async () => {
      setLoading(true);
      try {
        const invitationsRef = collection(db, 'invitations');
        const q = query(invitationsRef, where('token', '==', token));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setValid(false);
          return;
        }
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        setInvitationDocId(docSnap.id);
        setInvitationData(data);
        // expiresAt can be a Firestore Timestamp, JS Date, number, or ISO string
        let expiresAt;
        if (data.expiresAt && typeof data.expiresAt.toDate === 'function') {
          expiresAt = data.expiresAt.toDate();
        } else if (data.expiresAt instanceof Date) {
          expiresAt = data.expiresAt;
        } else if (typeof data.expiresAt === 'number') {
          expiresAt = new Date(data.expiresAt);
        } else if (typeof data.expiresAt === 'string') {
          expiresAt = new Date(data.expiresAt);
        }
        // Debug: log expiresAt and now
        // console.log('expiresAt:', expiresAt, 'now:', new Date());
        if (!expiresAt || isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
          setValid(false);
        } else {
          setValid(true);
        }
      } catch (e) {
        setValid(false);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, [token]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Verifying invitation...</div>;
  }

  const handleAccept = async () => {
    if (!invitationDocId || !invitationData) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      // 1. Update invitation status to ACCEPTED
      const invitationRef = firestoreDoc(db, 'invitations', invitationDocId);
      await updateDoc(invitationRef, { status: 'ACCEPTED' });

      // 2. Check if user exists by email
      const usersRef = collection(db, 'users');
      const userQ = query(usersRef, where('email', '==', invitationData.email));
      const userSnap = await getDocs(userQ);
      if (userSnap.empty) {
        // Redirect to signup if user does not exist
        router.push(`/auth/signup?email=${encodeURIComponent(invitationData.email)}`);
        return;
      }
      const userDoc = userSnap.docs[0];
      const userId = userDoc.id;

      // 3. Add user as member to workspace
      const workspaceRef = firestoreDoc(db, 'workspaces', invitationData.workspaceId);
      const workspaceSnap = await getDoc(workspaceRef);
      if (!workspaceSnap.exists()) {
        setAcceptError('Workspace not found.');
        setAccepting(false);
        return;
      }
      const workspaceData = workspaceSnap.data();
      const members = Array.isArray(workspaceData.members) ? workspaceData.members : [];
      // Avoid duplicate
      if (!members.some((m: any) => m.userId === userId)) {
        members.push({ userId, email: invitationData.email, role: 'member' });
        await updateDoc(workspaceRef, { members });
      }
      // Optionally, redirect to workspace/dashboard
      router.push(`/dashboard`);
    } catch (err: any) {
      setAcceptError('Failed to accept invitation.');
    } finally {
      setAccepting(false);
    }
  };

  if (valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Invitation Valid</h1>
        <p className="mb-4">Your invitation is valid. You can now accept and join the workspace.</p>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting ? 'Accepting...' : 'Accept Invitation'}
        </button>
        {acceptError && <div className="text-red-500 mt-2">{acceptError}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Invalid or Expired Invitation</h1>
      <p>The invitation link is invalid or has expired.</p>
    </div>
  );
}
