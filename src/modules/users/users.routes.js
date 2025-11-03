import { Router } from 'express';
import { verifyJWTToken } from '../../middlewares/auth.middleware.js';
import { changePassword, deleteUser, getCurrentUser, getUserById, updateUserProfile } from './users.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const UserRouter = Router();

UserRouter.post('/change-password', verifyJWTToken, changePassword);
UserRouter.get('/current-user', verifyJWTToken, getCurrentUser);
UserRouter.get('/:userId', verifyJWTToken, getUserById);
UserRouter.patch('/edit-profile', verifyJWTToken, upload.single('profile_photo'), updateUserProfile);
UserRouter.delete('/:userId', verifyJWTToken, deleteUser);

export default UserRouter;
