import express from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/quizzes', quizRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
