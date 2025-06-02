import bcrypt from 'bcryptjs';

async function test() {
  const plainPassword = '123456';
  
  // buat hash password
  const hash = await bcrypt.hash(plainPassword, 10);
  console.log('Hash password:', hash);

  // cek apakah password plain cocok dengan hash
  const isMatch = await bcrypt.compare(plainPassword, hash);
  console.log('Password cocok?', isMatch);
}

test();
