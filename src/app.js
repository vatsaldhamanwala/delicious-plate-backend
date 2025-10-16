import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

// parse URL-encoded from incoming from req.body
app.use(express.urlencoded({ extended: true }));

// importing routes
import UserRouter from './modules/users/user.routes.js';

app.use('/api/v1/users', UserRouter);

export default app;
// module.exports= app
// export {app}
