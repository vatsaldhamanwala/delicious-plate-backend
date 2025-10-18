import { Router } from 'express';
import { registerUser } from './users.controller.js';
import { upload } from '../../middlewares/multer.middleware.js';

const UserRouter = Router();

UserRouter.post('/register', upload.single('profile_photo'), registerUser);

export default UserRouter;
