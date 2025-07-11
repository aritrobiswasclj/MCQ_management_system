import express from 'express';
import cors from 'cors';


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


import quizRoutes from './routes/quizRoutes.js';


import authRoutes from './routes/authRoutes.js';

app.use('/api/auth', authRoutes);





import userRoutes from './routes/userRoutes.js';
app.use('./api/users', userRoutes);   // 👈 new



app.use('/api', quizRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('Backend running — API only.');
});


