import { Router } from 'express';
import { signUpUser } from './auth.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const AuthRoutes = Router();

AuthRoutes.post('/sign-up', upload.single('profile_photo'), signUpUser);

export default AuthRoutes;
