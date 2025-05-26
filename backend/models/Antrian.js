// models/Antrian.js
import mongoose from 'mongoose';

const antrianSchema = new mongoose.Schema({
  nisn: { type: String, required: true },
  nama: { type: String, required: true },
  status_data: { type: String, enum: ['lengkap', 'tidak'], required: true },
  nomor_antrian: { type: Number, required: true },
  status_pengajuan: { type: String, enum: ['belum', 'berhasil', 'gagal', 'pending'], default: 'belum' },
  waktu_dibuat: { type: Date, default: Date.now },
  waktu_dipanggil: { type: Date },
  waktu_selesai: { type: Date }
});

const Antrian = mongoose.model('Antrian', antrianSchema);

export default Antrian;
