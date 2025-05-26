import express from 'express';
import Siswa from '../models/Siswa.js';
import LastCalled from '../models/LastCalled.js';
import pusher from '../pusher.js';

const router = express.Router();

router.post('/call-next/:lab', async (req, res) => {
  try {
    const lab = req.params.lab;

    // Cari atau buat record LastCalled, tanpa lab dan tanggal
    let record = await LastCalled.findOne({});
    if (!record) {
      record = await LastCalled.create({ last_called: 0 });
    }

    const nextNumber = record.last_called + 1;

    // Cari siswa berdasarkan nomor antrian saja
    const siswa = await Siswa.findOne({ nomor_antrian: nextNumber });
    if (!siswa) {
      return res.status(404).json({
        message: 'Maaf, ini adalah data terakhir. Silakan tunggu beberapa saat.',
      });
    }

    // Update last_called
    record.last_called = nextNumber;
    await record.save();

    // Trigger pusher
    const kalimat = `Nomor antrian ${nextNumber}, atas nama ${siswa.nama}, silakan menuju ${lab}`;
    pusher.trigger('antrian-channel', 'next-antrian', {
      nomor: nextNumber,
      nama: siswa.nama,
      lab,
      kalimat,
    });

    return res.json({ success: true, nomor: nextNumber, nama: siswa.nama, lab });
  } catch (err) {
    console.error('Gagal call next:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
