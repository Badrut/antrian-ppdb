import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, nama, password, level, ruangan } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const user = new User({ username, nama, password, level, ruangan });
    await user.save();

    res.status(201).json({ message: 'User berhasil didaftarkan' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Username atau password salah' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Username atau password salah' });

    const token = jwt.sign(
      { id: user._id, username: user.username, level: user.level },
      'secretkey', // ganti dengan process.env.JWT_SECRET di production
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        username: user.username,
        nama: user.nama,
        level: user.level,
        ruangan: user.ruangan
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

export default router;
