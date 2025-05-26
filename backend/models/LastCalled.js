import mongoose from 'mongoose';

const LastCalledSchema = new mongoose.Schema({
  tanggal: { type: Date, required: true, unique: true },
  last_called: { type: Number, default: 0 },
});

const LastCalled = mongoose.model('LastCalled', LastCalledSchema);

export default LastCalled;
