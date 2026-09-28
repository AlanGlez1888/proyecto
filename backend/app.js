// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importamos la configuración de la base de datos
const { testConnection } = require('./config/db');

// Importamos las rutas
const authRoutes = require('./routes/authRoutes');
const carreraRoutes = require('./routes/carreraRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');   
const materiaRoutes = require('./routes/materiaRoutes');
const userRoutes = require('./routes/userRoutes');           

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.use('/api/carreras', carreraRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/materias', materiaRoutes); 
app.use('/api/users', userRoutes);

// Levantamos el servidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // Probamos la conexión a la BD al iniciar
    await testConnection();
});