const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const carreraRoutes = require('./routes/carreraRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const userRoutes = require('./routes/userRoutes');
const resenaRoutes = require('./routes/resenaRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/carreras', carreraRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/materias', materiaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resenas', resenaRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await testConnection();
});