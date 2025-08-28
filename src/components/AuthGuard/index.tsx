'use client';
import React, { ReactNode, useEffect } from 'react';
import { userStore, User } from '@/recoil';
import { useRecoilState } from 'recoil';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';



export default function AuthGuard({ children }: { children: ReactNode }) {
    const [currentUser, setcurrentUser] = useRecoilState(userStore);
    const userStr = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;

    useEffect(() => {
      if (userStr) {
        try {
          setcurrentUser(JSON.parse(userStr));
        } catch {
          setcurrentUser(null);
        }
      } else {
        setcurrentUser(null);
      }
    }, []);

    useEffect(() => {
      if (!userStr) {
        setcurrentUser(null);
        return;
      }
      let parsedUser = null;
      try {
        parsedUser = JSON.parse(userStr);
        setcurrentUser(parsedUser);
      } catch {
        setcurrentUser(null);
        return;
      }
      if (parsedUser?.id?.length > 0) {
        const unsub = onSnapshot(doc(db, 'users', parsedUser.id), (docSnap) => {
          setcurrentUser({ ...docSnap.data(), id: docSnap.id });
        });
        return () => unsub();
      }
    }, [userStr]);
  console.log(currentUser, 'currentUser....');

  return <div className="w-full h-full">{children}</div>;
}