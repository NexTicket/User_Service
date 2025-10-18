import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { verifyToken } from './middlewares/auth.js';
import userRoutes from './routers/users.router.js';

config(); // load .env

const app = express();
const PORT = process.env.PORT || 8080;

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

// User routes
app.use('/users', userRoutes);

// API routes with /api prefix for consistency with frontend
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 User Service running at http://localhost:${PORT}`);
});
