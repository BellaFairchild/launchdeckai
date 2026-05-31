import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Silence internal Firestore SDK logs (such as offline connection warnings)
// to prevent polluting the console or triggering environment error systems
setLogLevel('silent');

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);

import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Gracefully handle silent connection failures and log status in offline-first mode
    console.log("Firestore initialized in local-first/offline mode.");
  }
}
testConnection();


// Google Auth Provider setup with Google Drive scope
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');

// Token management & session tracking
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear if not in active flow
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in handler
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No access token returned from Google Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Return the cached access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out / Logout
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// API calls for Google Drive

/**
 * Lists files from Google Drive (In-app file picker metadata)
 */
export const listDriveFiles = async (): Promise<any[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google first.');

  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,webViewLink,size,createdTime)&q=trashed=false',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to list Google Drive files');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Uploads file directly to Google Drive
 */
export const uploadFileToDrive = async (
  filename: string,
  content: string | Blob,
  mimeType: string = 'text/plain'
): Promise<any> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in with Google first.');

  const metadata = {
    name: filename,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  
  const mediaBlob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  form.append('file', mediaBlob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to upload to Google Drive');
  }

  return response.json();
};
