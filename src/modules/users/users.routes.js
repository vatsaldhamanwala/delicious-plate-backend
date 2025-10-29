import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import { changePassword, getCurrentUser, getUserById, updateUserProfile } from './users.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const UserRouter = Router();

UserRouter.post('/change-password', verifyJWTToken, changePassword);
UserRouter.get('/current-user', verifyJWTToken, getCurrentUser);
UserRouter.get('/:userId', verifyJWTToken, getUserById);

export default UserRouter;
