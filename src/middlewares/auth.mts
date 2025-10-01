import { auth, db } from '../firebase.mts';
import express from 'express';

interface AuthenticatedRequest extends express.Request {
  user?: any;
}

export const verifyToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): Promise<void> => {
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
