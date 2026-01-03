/**
 * Firebase Service (Placeholder)
 * Structure ready for future Firebase integration
 *
 * TODO: Install firebase package when backend is ready
 * TODO: Add firebaseConfig from Firebase Console
 * TODO: Implement Firestore sync for timelines
 * TODO: Add authentication (Google Sign-In, Apple Sign-In)
 * TODO: Implement cloud sync logic
 *
 * Commands to install:
 * npm install firebase
 */

import { Timeline } from '@/types/timeline';

/**
 * Initialize Firebase
 * NOT ACTIVE IN MVP - Structure only
 */
export function initializeFirebase(): void {
  // PLACEHOLDER - Not active in MVP
  console.log('Firebase: Structure ready, not initialized');

  /*
  TODO: Implement Firebase initialization

  import { initializeApp } from 'firebase/app';
  import { getFirestore } from 'firebase/firestore';
  import { getAuth } from 'firebase/auth';

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  */
}

/**
 * Sync timelines with Firestore
 * NOT ACTIVE IN MVP - Will sync local AsyncStorage with Firestore
 */
export async function syncTimelines(): Promise<void> {
  // PLACEHOLDER - Will sync local AsyncStorage with Firestore
  console.log('Firebase: syncTimelines called, but not implemented');

  /*
  TODO: Implement Firestore sync

  1. Get current user ID from auth
  2. Fetch timelines from Firestore for this user
  3. Merge with local timelines (conflict resolution)
  4. Update both local and Firestore
  5. Set up real-time listeners for changes
  */
}

/**
 * Upload a timeline to Firestore
 * NOT ACTIVE IN MVP
 */
export async function uploadTimeline(timeline: Timeline): Promise<void> {
  // PLACEHOLDER
  console.log('Firebase: uploadTimeline called, but not implemented', timeline.id);

  /*
  TODO: Implement Firestore upload

  import { collection, doc, setDoc } from 'firebase/firestore';

  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  await setDoc(doc(db, `users/${userId}/timelines`, timeline.id), timeline);
  */
}

/**
 * Delete a timeline from Firestore
 * NOT ACTIVE IN MVP
 */
export async function deleteTimelineFromFirestore(timelineId: string): Promise<void> {
  // PLACEHOLDER
  console.log('Firebase: deleteTimelineFromFirestore called, but not implemented', timelineId);

  /*
  TODO: Implement Firestore delete

  import { doc, deleteDoc } from 'firebase/firestore';

  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  await deleteDoc(doc(db, `users/${userId}/timelines`, timelineId));
  */
}

/**
 * Sign in with Google
 * NOT ACTIVE IN MVP
 */
export async function signInWithGoogle(): Promise<void> {
  // PLACEHOLDER
  console.log('Firebase: signInWithGoogle called, but not implemented');

  /*
  TODO: Implement Google Sign-In

  import { GoogleSignin } from '@react-native-google-signin/google-signin';
  import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(auth, googleCredential);
  */
}

/**
 * Sign in with Apple
 * NOT ACTIVE IN MVP
 */
export async function signInWithApple(): Promise<void> {
  // PLACEHOLDER
  console.log('Firebase: signInWithApple called, but not implemented');

  /*
  TODO: Implement Apple Sign-In

  import * as AppleAuthentication from 'expo-apple-authentication';
  import { signInWithCredential, OAuthProvider } from 'firebase/auth';

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  const provider = new OAuthProvider('apple.com');
  const oauthCredential = provider.credential({
    idToken: credential.identityToken!,
  });

  await signInWithCredential(auth, oauthCredential);
  */
}

/**
 * Sign out
 * NOT ACTIVE IN MVP
 */
export async function signOut(): Promise<void> {
  // PLACEHOLDER
  console.log('Firebase: signOut called, but not implemented');

  /*
  TODO: Implement sign out

  import { signOut as firebaseSignOut } from 'firebase/auth';

  await firebaseSignOut(auth);
  */
}

/**
 * Get current user
 * NOT ACTIVE IN MVP
 */
export function getCurrentUser(): any {
  // PLACEHOLDER
  console.log('Firebase: getCurrentUser called, but not implemented');
  return null;

  /*
  TODO: Implement get current user

  return auth.currentUser;
  */
}
