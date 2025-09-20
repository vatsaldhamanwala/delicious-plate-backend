import dotenv from 'dotenv';
import connectDB from './mongodb/database.js';
import app from './app.js';

dotenv.config({ path: '/.env' });

// const PORT= process.env.PORT || 8000

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('👎🏻 MongoDB Database Connection Failed !!');
  });
