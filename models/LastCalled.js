import mongoose from 'mongoose';

const lastCalledSchema = new mongoose.Schema({
  lab: { type: String, unique: true },
  last_called: { type: Number, default: 0 },
  last_called_at: { type: Date, default: new Date(0) }
});

export default mongoose.model('LastCalled', lastCalledSchema);