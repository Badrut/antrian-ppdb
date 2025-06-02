import mongoose from 'mongoose';

const LoketSchema = new mongoose.Schema({
  loket_name: {
    type: String,
    required: true,
    unique: true,
  },
  nisn: {
    type: String,
    default: null,
  },
  nomor_antrian: {
    type: Number,
    default: null,
  },
  nama: { 
    type: String, 
    default:null, },
});

export default mongoose.model('Loket', LoketSchema);
