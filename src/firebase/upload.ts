import {getStorage, ref, uploadBytes } from "firebase/storage"


export const uploadFile=async(file:any)=>{
    const storage = getStorage();
    const fileId=Math.random().toString(36).substring(2,8+2);
    const storageRef = ref(storage, `/${fileId}`);
    const snapshot=await uploadBytes(storageRef, file)
    return `https://firebasestorage.googleapis.com/v0/b/${snapshot?.metadata?.bucket}/o/${snapshot?.metadata?.name}?alt=media`
}