import express from 'express';
import Siswa from '../models/Siswa.js';
import LastCalled from '../models/LastCalled.js';
import pusher from '../pusher.js';
import TransitAntrian from '../models/TransitSiswa.js';
import { acquireGlobalLock, releaseGlobalLock } from '../lock.js';
import Loket from '../models/Loket.js';

const router = express.Router();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/call-next/:loket', async (req, res) => {
  await acquireGlobalLock(); // Ambil global lock, tunggu jika sudah di-lock

  try {
    const loket = req.params.loket;

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

    await TransitAntrian.create({ nisn: siswa.nisn, loket });
    record.last_called = nextNumber;
    await record.save();

    await Loket.findOneAndUpdate(
      { loket_name: loket },     
      { nisn: siswa.nisn, nomor_antrian: siswa.nomor_antrian, nama: siswa.nama  },      
      { new: true }              
    );
    const kalimat = `Nomor antrian ${nextNumber}, silakan menuju ${loket}`;

    await delay(10000);
    pusher.trigger('antrian-channel', 'next-antrian', {
      nomor: nextNumber,
      nama: siswa.nama,
      loket,
      kalimat,
    });

    return res.json({ success: true, nomor: nextNumber, nama: siswa.nama, loket, nisn: siswa.nisn });
  } catch (err) {
    console.error('Gagal call next:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    releaseGlobalLock(); 
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

router.get('/transit-siswa/:loket', async (req, res) => {
  try {
    const loket = req.params.loket;

    // Ambil semua data dari TransitAntrian untuk loket tertentu
    const transitData = await TransitAntrian.find({ loket });

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

    // return res.json({
    //   message: 'Data gabungan berhasil diambil',
    //   loket,
    //   transitData,
    //   nisnList,
    //   siswaList,
    //   result,
    // });

    return res.json(result);
  } catch (err) {
    console.error('Gagal ambil data transit by loket:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/loket', async (req, res) => {
  try {
    const siswa = await Loket.find();
    res.json(siswa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
