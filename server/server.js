import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import e from 'express';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import showRouter from './routes/showRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());


// Routes
app.get('/', (req, res) => {
  res.send('FeelCinemagic Server is running');
});
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});