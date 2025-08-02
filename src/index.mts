import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { verifyToken } from './middlewares/auth.mts';
import userRoutes from './routers/users.router.mts';

config(); // load .env

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
  res.send('👋 User Service is running with .mts and ESM!');
});

// Protected route example
app.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Profile data retrieved successfully',
    user: req.user
  });
});

// Health check
app.get('/health', (_, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
  service: 'User Service'
  });
});

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 User Service running at http://localhost:${PORT}`);
});
