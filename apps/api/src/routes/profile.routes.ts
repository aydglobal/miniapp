import { Router } from 'express';
import { getProfile } from '../services/profile.service';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.user!.id;

  // Admin bypass dummy user
  if (userId === 'admin') {
    return res.json({ success: true, user: { id: 'admin', isAdmin: true, displayName: 'Admin' } });
  }

  const user = await getProfile(userId);
  res.json({ success: true, user });
});

export default router;
