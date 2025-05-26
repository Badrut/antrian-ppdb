import mongoose from 'mongoose';

const siswaSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  nisn: { type: String, required: true, unique: true },
  
  checklistItems: {
    type: [Boolean],              // <- tipe array of Boolean
    default: [false, false, false, false, false],
    validate: [arrayLimit, 'Checklist maksimal 5 item']
  },

  nomor_antrian: {
    type: Number,
    default: null                // tidak wajib langsung punya nomor antrian
  },
}, { timestamps: true });

// Validasi agar maksimal hanya 5 checklist
function arrayLimit(val) {
  return val.length <= 5;
}

const Siswa = mongoose.model('Siswa', siswaSchema);
export default Siswa;
