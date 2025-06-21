import express from 'express';
import cors from 'cors';
import quizRoutes from './routes/quizRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', quizRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('Backend running — API only.');
});


