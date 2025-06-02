import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  nama: { type: String, required: true },
  level: { type: String, enum: ['admin', 'guru', 'operator' , 'verifikator'], required: true },
  loket: { type: String } // opsional

}, {
  timestamps: true
});

// Validasi kondisi level dan loket
userSchema.pre('validate', function (next) {
  if (this.level === 'guru' && !this.loket) {
    this.invalidate('loket', 'Guru harus memiliki loket');
  }
  if (this.level !== 'guru' && this.loket) {
    this.invalidate('loket', 'Hanya guru yang boleh memiliki loket');
  }
  next();
});

// Hash password sebelum disimpan
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metode untuk mencocokkan password saat login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
