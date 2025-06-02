import mongoose from 'mongoose';

const transitAntrianSchema = new mongoose.Schema({
  nisn: { type: String, required: true, unique: true },
  loket: { type: String, required: true },
  waktu_dipanggil: { type: Date, default: Date.now },
});

const TransitAntrian = mongoose.model('TransitAntrian', transitAntrianSchema);
export default TransitAntrian;
