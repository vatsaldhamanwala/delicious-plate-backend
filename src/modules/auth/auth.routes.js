import { Router } from 'express';
import { loginUser, logoutUser, refreshAccessToken, signUpUser } from './auth.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';

const AuthRoutes = Router();

AuthRoutes.post('/sign-up', upload.single('profile_photo'), signUpUser);
AuthRoutes.post('/login', loginUser);
AuthRoutes.post('/logout', verifyJWTToken, logoutUser);
AuthRoutes.post('/refresh-token', refreshAccessToken);

export default AuthRoutes;
