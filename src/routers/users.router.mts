import Express from 'express';
import { verifyToken } from '../middlewares/auth.mts';
import { Router, Request, Response } from 'express';
import { db } from '../firebase.mts';
import { auth } from '../firebase.mts'; 
import { sendLoginEmail } from '../utils/sendEmail.mts';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
    if (req.user?.role !== 'admin'){
        return res.status(403).json({error: 'Forbidden: Admin access required'});
    }

    try{
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({
            uid:doc.id,
            ...doc.data()
        }));
        res.status(200).json({data:users,message:"all users "})

    }catch(error){
        console.error('Error fetching users:', error);
        res.status(500).json({error: 'Internal Server Error'});

    }
});

// PATCH /users/:uid/role - Admin only
router.patch('/:uid/role', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { uid } = req.params;
  const { role, assignedEventId, tenantId } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const userRef = db.collection('users').doc(uid);

    const updateData = { role };

    // // Optionally add related fields (like for checkin officers or event admins)
    // if (assignedEventId) updateData.assignedEventId = assignedEventId;
    // if (tenantId) updateData.tenantId = tenantId;

    await userRef.update(updateData);

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});


router.post('/checkin-officer', verifyToken, async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  const { email, firstName, lastName, eventId } = req.body;

  if (!email || !eventId) {
    return res.status(400).json({ error: 'Email and eventId are required' });
  }

  try {
    // 1. Create Firebase user (generate temp password)
    const password = Math.random().toString(36).slice(-8); 
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName || ''} ${lastName || ''}`.trim(),
    });

    const uid = userRecord.uid;

    // 2. Save metadata in Firestore
    await db.collection('users').doc(uid).set({
      role: 'checkin_officer',
      firstName,
      lastName,
      email,
      assignedEventId: eventId,
      createdAt: new Date()
    });

    await sendLoginEmail({
        to: email,
        email,
        password,
        firstName,
        role: 'check-in officer'
    });

    res.json({
      message: 'Check-in officer created successfully',
      uid,
      email,
      password // (optional: show this only to admin, not store in DB)
    });
  } catch (err) {
    console.error('Error creating check-in officer:', err);
    res.status(500).json({ error: 'Failed to create check-in officer' });
  }
});



export default router;