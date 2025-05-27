import express from 'express';
import Siswa from '../models/Siswa.js';
import LastCalled from '../models/LastCalled.js';
import pusher from '../pusher.js';
import TransitAntrian from '../models/TransitSiswa.js';
import { acquireGlobalLock, releaseGlobalLock } from '../lock.js';

const router = express.Router();

router.post('/call-next/:lab', async (req, res) => {
  await acquireGlobalLock(); // Ambil global lock, tunggu jika sudah di-lock

  try {
    const lab = req.params.lab;
    console.log('Lab diterima:', lab);

    let record = await LastCalled.findOne({});
    if (!record) {
      record = await LastCalled.create({ last_called: 0 });
    }

    const nextNumber = record.last_called + 1;
    const siswa = await Siswa.findOne({ nomor_antrian: nextNumber });
    if (!siswa) {
      return res.status(404).json({
        message: 'Maaf, ini adalah data terakhir. Silakan tunggu beberapa saat.',
      });
    }

    const sudahTransit = await TransitAntrian.findOne({ nisn: siswa.nisn });
    if (sudahTransit) {
      return res.status(400).json({ message: 'Siswa sudah dipanggil dan sedang transit' });
    }

    await TransitAntrian.create({ nisn: siswa.nisn, lab });
    record.last_called = nextNumber;
    await record.save();

    const kalimat = `Nomor antrian ${nextNumber}, atas nama ${siswa.nama}, silakan menuju ${lab}`;
    pusher.trigger('antrian-channel', 'next-antrian', {
      nomor: nextNumber,
      nama: siswa.nama,
      lab,
      kalimat,
    });

    return res.json({ success: true, nomor: nextNumber, nama: siswa.nama, lab, nisn: siswa.nisn });
  } catch (err) {
    console.error('Gagal call next:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    releaseGlobalLock(); // Lepas global lock supaya request berikutnya bisa jalan
  }
});


router.put('/finish-call/:nisn', async (req, res) => {
  try {
    const { status, keterangan } = req.body;
    const nisn = req.params.nisn;

    // Update status dan keterangan di Siswa
    const updatedSiswa = await Siswa.findOneAndUpdate(
      { nisn },
      { status, keterangan },
      { new: true }
    );

    if (!updatedSiswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }

    // Hapus dari TransitAntrian karena sudah selesai
    await TransitAntrian.deleteOne({ nisn });

    return res.json({ success: true, updatedSiswa });
  } catch (err) {
    console.error('Gagal update siswa:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/transit-siswa/:lab', async (req, res) => {
  try {
    const lab = req.params.lab;

    // Ambil semua data dari TransitAntrian untuk lab tertentu
    const transitData = await TransitAntrian.find({ lab });

    // Ambil semua nisn
    const nisnList = transitData.map(item => item.nisn);

    // Ambil data siswa berdasarkan nisn
    const siswaList = await Siswa.find({ nisn: { $in: nisnList } });

    // Gabungkan data transit dan siswa
    const result = transitData.map(transit => {
      const siswa = siswaList.find(s => s.nisn === transit.nisn);
      return {
        ...transit._doc,
        siswa: siswa || null,
      };
    });

    return res.json(result);
  } catch (err) {
    console.error('Gagal ambil data transit by lab:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
