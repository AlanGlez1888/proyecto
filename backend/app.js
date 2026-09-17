// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la configuración de la base de datos
const { testConnection } = require('./config/db');

// Importamos las rutas
const authRoutes = require('./routes/authRoutes');
const carreraRoutes = require('./routes/carreraRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/carreras', carreraRoutes);
app.use('/api/auth', authRoutes);

// Levantamos el servidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // Probamos la conexión a la BD al iniciar
    await testConnection();
});