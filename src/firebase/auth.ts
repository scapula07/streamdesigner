import {
    createUserWithEmailAndPassword,
     signInWithEmailAndPassword ,
     GoogleAuthProvider,
     signInWithPopup,
     sendPasswordResetEmail,
     signOut,sendEmailVerification,sendSignInLinkToEmail,signInWithEmailLink,isSignInWithEmailLink} from "firebase/auth";
    
import { doc,getDoc,setDoc,updateDoc }  from "firebase/firestore";
import { auth,db } from "./config";

export const authApi= {

    googleAuth:async function (account: any) {
       try{ 
             const provider = new GoogleAuthProvider();
             provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
             const res =  await signInWithPopup(auth,provider);
             const credential = GoogleAuthProvider.credentialFromResult(res);
             const token = credential?.accessToken;
             const user = res.user;
             console.log(user,"user....");
             const ref =doc(db,"users",user?.uid);
             const docSnap1 = await getDoc(ref);
             if(docSnap1.exists()){
                throw new Error("Email already used");
             }

             await setDoc(ref,{
                 id:user?.uid,
                 email:user?.email,
                 onboarded:false
              });

           const docSnap = await getDoc(ref);
            if (docSnap.exists()) {
                return {
                    id:docSnap?.id,
                    ...docSnap?.data()
                 };
              }  
         }catch(e){
             console.log(e);
            //  throw new Error((e as Error).message);
         }


     },

     resetEmail:async function (email: string) {
         try{
           const res=await sendPasswordResetEmail(auth, email);
           console.log(res,"ressss");
           return true;
          }catch(e){
             console.log(e);
             throw new Error((e as Error).message);
          }

     },
     googleLogin:async function () {
        try{

             const provider = new GoogleAuthProvider();
             const res =  await signInWithPopup(auth,provider);
             const credential = GoogleAuthProvider.credentialFromResult(res);
             const token = credential?.accessToken;
             const user = res.user;
             const ref =doc(db,"users",user?.uid);

               const docSnap = await getDoc(ref);
               console.log(docSnap.data(),"user data");
                 if (docSnap.exists()) {          
                     const docUser = await getDoc(ref);
                     return {id:docUser?.id,...docUser?.data()};
           
                   } else {
                   console.log("No such document!");
                   throw new Error("You are not signed up");
                 }

          }catch(e){
         console.log(e);
         throw new Error((e as Error).message);
          }

     },
    handleEmailOnlyAuth: async (email: string) => {
      // Define ActionCodeSettings
      const actionCodeSettings = {
        url: 'http://localhost:3000/signup/finish2', // Add your redirect URL
        handleCodeInApp: true,
  
      };

      try {
        // Step 1: If current page is NOT the sign-in link, send the link to user's email
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          await sendSignInLinkToEmail(auth, email, actionCodeSettings);
          // Save email to local storage for later
          window.localStorage.setItem('emailForSignIn', email);
          return { success: true, message: "Sign-in link sent to email" };
        }

        // Step 2: If this page is the sign-in link, complete the sign-in process
        let storedEmail = window.localStorage.getItem('emailForSignIn');
        if (!storedEmail) {
          // If no email is stored, ask the user for their email
          storedEmail = window.prompt('Please provide your email for confirmation') || '';
        }

        const result = await signInWithEmailLink(auth, storedEmail, window.location.href);
        // Clear email from storage after successful sign-in
        window.localStorage.removeItem('emailForSignIn');

        return {
          success: true,
          message: "Sign-in successful",
          user: result.user
        };

      } catch (error) {
        const errorMessage = (error as Error).message;
        return { success: false, error: errorMessage };
      }
    },
     logout: async function () {
          try{
              const response=await signOut(auth)
              return response
          }catch(error){
              
              const errorMessage = (error as Error).message;
              return { success: false, error: errorMessage };
          }
        },
};