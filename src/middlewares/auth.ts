import { auth, db } from '../firebase.js';
import express from 'express';

interface AuthenticatedRequest extends express.Request {
  user?: any;
}

export const verifyToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): Promise<void> => {
  // 🔑 Check if API Gateway already authenticated (trust X-User-* headers)
  const xUserId = req.headers['x-user-id'] as string;
  const xUserEmail = req.headers['x-user-email'] as string;
  const xUserRole = req.headers['x-user-role'] as string;

  if (xUserId && xUserEmail && xUserRole) {
    // API Gateway already authenticated - trust the headers
    console.log(`✅ Using API Gateway auth: ${xUserEmail} (${xUserRole})`);
    
    // Fetch additional user data from Firestore if needed
    try {
      const userDoc = await db.collection('users').doc(xUserId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      req.user = {
        uid: xUserId,
        email: xUserEmail,
        role: xUserRole,
        name: xUserEmail.split('@')[0], // Extract name from email as fallback
        ...userData // Include any additional Firestore data
      };
    } catch (error) {
      // If Firestore fetch fails, just use the headers
      console.warn('⚠️ Could not fetch user data from Firestore, using headers only');
      req.user = {
        uid: xUserId,
        email: xUserEmail,
        role: xUserRole,
        name: xUserEmail.split('@')[0]
      };
    }
    
    return next();
  }

  // No API Gateway headers - verify token directly
  const header = req.headers['authorization'];

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = header.split(' ')[1];

  if (!idToken) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Get user metadata from Firestore
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User metadata not found' });
      return;
    }

    const userData = userDoc.data();

    // Attach to request
    req.user = {
      uid,
      email: decoded.email,
      ...userData
    };

    next();
  } catch (err) {
    console.error('Firebase token verification failed:', err);
    
    
    if (err instanceof Error) {
      if (err.message.includes('Firebase ID token has expired')) {
        res.status(401).json({ error: 'Token has expired' });
        return;
      }
      if (err.message.includes('Firebase ID token has invalid signature')) {
        res.status(401).json({ error: 'Invalid token signature' });
        return;
      }
    }
    
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};
