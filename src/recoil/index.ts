import { atom } from "recoil";


export interface User {
  id?: string;
  email?: string;
  companyName?: string;
  industry?: string;
  discovery?: string;
  onboarded?: boolean;
}

export const userStore = atom<User | null>({
  key: 'userStore',
  default: null,
});

