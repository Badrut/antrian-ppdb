import express from 'express';
import Siswa from '../models/Siswa.js';

const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const { nama, nisn, checklistItems } = req.body;

    // Hitung apakah semua true
    const semuaTercentang = checklistItems.every(item => item === true);

    let nomor_antrian = null;
    if (semuaTercentang) {
      const lastSiswa = await Siswa.findOne().sort({ nomor_antrian: -1 });
      nomor_antrian = lastSiswa?.nomor_antrian ? lastSiswa.nomor_antrian + 1 : 1;
    }

    const newSiswa = new Siswa({
      nama,
      nisn,
      checklistItems,
      nomor_antrian
    });

    await newSiswa.save();
    res.status(201).json({ message: 'Siswa berhasil ditambahkan', data: newSiswa });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'NISN sudah terdaftar' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan siswa' });
  }
});



router.get('/', async (req, res) => {
  try {
    const siswa = await Siswa.find();
    res.json(siswa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE siswa berdasarkan NISN
router.put('/:nisn', async (req, res) => {
  try {
    const { checklistItems } = req.body;

    let updateData = { ...req.body };

    if (checklistItems) {
      // cek semua true atau tidak
      const semuaTercentang = checklistItems.every(item => item === true);

      if (semuaTercentang) {
        // cek data siswa sekarang
        const siswaSekarang = await Siswa.findOne({ nisn: req.params.nisn });

        // jika belum ada nomor_antrian, berikan nomor baru
        if (!siswaSekarang?.nomor_antrian) {
          const lastSiswa = await Siswa.findOne().sort({ nomor_antrian: -1 });
          const nomor_antrian_baru = lastSiswa?.nomor_antrian ? lastSiswa.nomor_antrian + 1 : 1;
          updateData.nomor_antrian = nomor_antrian_baru;
        }
      } else {
        // kalau tidak semua checklist true, nomor_antrian dihapus
        updateData.nomor_antrian = null;
      }
    }

    const updated = await Siswa.findOneAndUpdate(
      { nisn: req.params.nisn },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
