import { Router } from 'express';
const router = Router();
router.post('/create', (req,res)=> res.json({ok:true}));
router.post('/join', (req,res)=> res.json({ok:true}));
export default router;