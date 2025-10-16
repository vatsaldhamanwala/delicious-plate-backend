import { Router } from 'express';
import { registerUser } from './user.controller.js';

const UserRouter = Router();

UserRouter.post('/register', registerUser);

export default UserRouter;
