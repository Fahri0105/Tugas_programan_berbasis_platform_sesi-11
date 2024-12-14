const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

app.use(express.json());

const secretKey = 'admin123';

const user = {
  id: 1,
  username: 'admin'
};

const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
console.log('token:', token);

const decoded = jwt.verify(token, secretKey);
console.log('decoded:', decoded);

// middleware verifikasi token
const verifyToken = (req, res, next) => {
  const header = req.header('Authorization');
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: 'akses ditolak, token tidak ada' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'token tidak valid' });
  }
};

app.get('/token', verifyToken, (req, res) => {
  res.json({ message: 'akses diberikan' });
});

// menambahkan data (CREATE)
app.post('/barang', async (req, res) => {
  const { nama_barang, status_barang } = req.body;
  try {
    const barang = await prisma.barang.create({
      data: {
        nama_barang,
        status_barang
      }
    });
    res.status(201).json({ message: 'data berhasil ditambahkan', id: barang.id });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal menambahkan data' });
  }
});

// mendapatkan data (READ)
app.get('/barang', async (req, res) => {
  try {
    const barang = await prisma.barang.findMany();
    res.json(barang);
  } catch (err) {
    return res.status(500).json({ message: 'Gagal mengambil data barang' });
  }
});

// memperbarui data (UPDATE)
app.put('/barang/:id', async (req, res) => {
  const { id } = req.params;
  const { nama_barang, status_barang } = req.body;
  try {
    await prisma.barang.update({
      where: { id: parseInt(id) },
      data: { nama_barang, status_barang }
    });
    res.json({ message: 'data berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal memperbarui data' });
  }
});

// menghapus data (DELETE)
app.delete('/barang/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.barang.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'data berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal menghapus data barang' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
