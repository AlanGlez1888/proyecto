// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db.js');

// Lógica para registrar un nuevo usuario
const register = async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { nombre, apellido_paterno, apellido_materno, id_carrera, semestre, correo, contrasena } = req.body;

        if (!nombre || !apellido_paterno || !id_carrera || !semestre || !correo || !contrasena) {
            return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos' });
        }

        await connection.beginTransaction();

        // Verificar si el correo ya existe
        const [existingUser] = await connection.query('SELECT ID_Usuario FROM usuario WHERE Correo = ?', [correo]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // 1. Insertar en tabla usuario
        const [userResult] = await connection.query(
            'INSERT INTO usuario (Correo, Contrasena, Rol, Estado) VALUES (?, ?, ?, ?)',
            [correo, hashedPassword, 'alumno', 'activo']
        );

        const newUserId = userResult.insertId;

        // 2. Insertar en tabla alumno
        await connection.query(
            'INSERT INTO alumno (ID_Usuario, Nombre_Alumno, APat_Alumno, AMat_Alumno, ID_Carrera, Semestre) VALUES (?, ?, ?, ?, ?, ?)',
            [newUserId, nombre, apellido_paterno, apellido_materno || null, id_carrera, semestre]
        );

        await connection.commit();
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    } finally {
        connection.release();
    }
};

// Lógica para el login
const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // Consultar directamente usuario para obtener Rol y Estado reales
        const [rows] = await db.query(
            'SELECT ID_Usuario, Correo, Contrasena, Rol, Estado FROM usuario WHERE Correo = ?',
            [correo]
        );

        const usuario = rows[0];

        if (!usuario) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(contrasena, usuario.Contrasena);
        if (!isMatch) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }

        // Verificar que la cuenta no esté suspendida ni baneada
        const estadoUsuario = (usuario.Estado || 'activo').toLowerCase();
        if (estadoUsuario !== 'activo') {
            return res.status(403).json({
                message: `Tu cuenta se encuentra ${estadoUsuario}. Contacta a un administrador.`
            });
        }

        const rolUsuario = (usuario.Rol || 'alumno').toLowerCase();

        // Buscar datos del alumno si existen
        const [alumnoRows] = await db.query(
            'SELECT ID_Alumno, Nombre_Alumno, APat_Alumno FROM alumno WHERE ID_Usuario = ?',
            [usuario.ID_Usuario]
        );
        const alumno = alumnoRows[0] || null;

        // Generar Token JWT con el rol real
        const token = jwt.sign(
            { id: usuario.ID_Usuario, rol: rolUsuario },
            process.env.JWT_SECRET || 'secreto_temporal',
            { expiresIn: '2h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: usuario.ID_Usuario,
                correo: usuario.Correo,
                rol: rolUsuario,
                idAlumno: alumno ? alumno.ID_Alumno : null,
                nombreCompleto: alumno
                    ? `${alumno.Nombre_Alumno} ${alumno.APat_Alumno}`.trim()
                    : 'Administrador'
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login, register };