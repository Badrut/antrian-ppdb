import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Loket from '../models/Loket.js';

dotenv.config(); // Memuat isi .env

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/antrian_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedLoket = async () => {
  try {
    await Loket.deleteMany(); // Hapus semua data loket sebelumnya

    const data = [];
    for (let i = 1; i <= 16; i++) {
      const name = `B-${i.toString().padStart(2, '0')}`;
      data.push({ loket_name: name, nisn: null, nomor_antrian: null, nama: null });
    }

    await Loket.insertMany(data);
    console.log('Seeder selesai.');
  } catch (err) {
    console.error('Seeder gagal:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedLoket();
