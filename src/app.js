import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

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

// add cookie
app.use(cookieParser());

// importing routes
import AuthRoutes from './modules/auth/auth.routes.js';

app.use('/api/v1/auth', AuthRoutes);

export default app;
// module.exports= app
// export {app}
