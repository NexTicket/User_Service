import type { NextFunction, Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../firebase.js';

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // If no auth header, continue without setting req.user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('👤 No authentication provided - continuing as public request');
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Check for custom claims first
    let userRole = decodedToken.role;
    
    // TEMPORARY FIX: Check if user is admin by email until custom claims are properly set
    const adminEmails = [
      'admin@nexticket.com', 
      'admin@company.com',
      'admin@test.com',
      'test@admin.com',
      'hello@Hi.com'
    ];
    
    const isAdminEmail = decodedToken.email && (
      adminEmails.includes(decodedToken.email.toLowerCase()) ||
      decodedToken.email.toLowerCase().includes('admin') ||
      process.env.NODE_ENV === 'development'
    );
    
    if (!userRole && isAdminEmail) {
      userRole = 'admin';
    }
    
    // Get user metadata from Firestore to supplement the token
    try {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        userRole = userData?.role || userRole;
      }
    } catch (firestoreError) {
      console.log('⚠️ Could not fetch user metadata from Firestore:', firestoreError);
    }
    
    if (!userRole) {
      userRole = 'customer'; // fallback
    }
    
    // Attach user info to req.user
    req.user = {
      uid: decodedToken.uid,
      role: userRole,
      email: decodedToken.email,
    };
    
    console.log('👤 Authenticated user:', req.user);
    next();
  } catch (err) {
    // If token is invalid, continue as public request instead of throwing error
    console.log('⚠️ Invalid token provided - continuing as public request:', (err as Error).message || err);
    next();
  }
};