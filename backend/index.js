import express from 'express';
import mongoose from 'mongoose';
import antrianRouter from './routing/antrian.js';
import authRouter from './routing/auth.js';
import siswaRouter from './routing/siswa.js';
import cors from 'cors'; 
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());



// wajib dipasang dulu sebelum route
app.use('/api', antrianRouter); // pasang router
app.use('/api/auth', authRouter);
app.use('/api/siswa', siswaRouter);
mongoose.connect('mongodb://localhost:27017/antrian_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
