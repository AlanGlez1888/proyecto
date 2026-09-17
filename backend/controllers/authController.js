// backend/controllers/authController.js
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db.js'); 

// Lógica para registrar un nuevo usuario 
const register = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { nombre, apellido_paterno, apellido_materno, id_carrera, semestre, correo, contraseña } = req.body;
        
        // Verificar campos obligatorios
        if (!nombre || !apellido_paterno || !id_carrera || !semestre || !correo || !contraseña) {
            return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos' });
        }

        await connection.beginTransaction();

        // Verificar si el correo ya existe
        const [existingUser] = await connection.query('SELECT * FROM usuario WHERE Correo = ?', [correo]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        // 1. Insertar en tabla usuario
        const [userResult] = await connection.query(
            'INSERT INTO usuario (Correo, Contraseña, Rol) VALUES (?, ?, ?)', 
            [correo, hashedPassword, 'Alumno']
        );

        const newUserId = userResult.insertId;

        // 2. Insertar en tabla alumno (Vinculando ID_Usuario)
        await connection.query(
            'INSERT INTO alumno (ID_Usuario, Nombre_Alumno, APat_Alumno, AMat_Alumno, ID_Carrera, Semestre) VALUES (?, ?, ?, ?, ?, ?)', 
            [newUserId, nombre, apellido_paterno, apellido_materno || null, id_carrera, semestre]
        );

        await connection.commit();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    } finally {
        connection.release();
    }
};

// Lógica para el login
const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Buscar usuario en la base de datos
        const usuario = await Usuario.findByCorreo(correo);
        if (!usuario) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Comparar contraseña con el campo Contraseña de la BD
        const isMatch = await bcrypt.compare(contrasena, usuario.Contraseña);
        if (!isMatch) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: usuario.ID_Usuario, rol: usuario.Rol },
            process.env.JWT_SECRET || 'secreto_temporal',
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: usuario.ID_Usuario,
                correo: usuario.Correo,
                rol: usuario.Rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login, register };