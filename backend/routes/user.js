import express from 'express';
import { register,login,logout,googleLogin,getProfile,updateProfile} from '../Controllers/user.js';
import { protect } from '../Middlewares/authentication.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);
router.get('/logout', logout);

export default router;