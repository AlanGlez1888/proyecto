// Lista base de palabras prohibidas (puedes ampliarla cuando quieras)
const PALABRAS_PROHIBIDAS = [
    'pendejo', 'pendeja', 'idiota', 'estupido', 'estupida', 'imbecil',
    'puto', 'puta', 'verga', 'chinga', 'chingar', 'cabron', 'cabrona',
    'culero', 'culera', 'mamada', 'mamon', 'pinche', 'bastardo', 'zorra',
    'maricon', 'maricón', 'coño', 'cojones', 'gilipollas', 'mierda',
    'polla', 'pene', 'maldito', 'maldita', 'perra', 'perro', 'hdpm', 'put0'
];

// Registro en memoria para frenar spam por frecuencia y textos repetidos
const historialUsuarios = new Map();

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quita acentos
        .replace(/[@4]/g, 'a')
        .replace(/[3]/g, 'e')
        .replace(/[1!]/g, 'i')
        .replace(/[0]/g, 'o')
        .replace(/[5]/g, 's')
        .replace(/[^a-z0-9\s]/g, '') // Quita caracteres especiales
        .replace(/\s+/g, ' ') // Reemplaza múltiples espacios por uno solo
        .replace(/\b(.)\1+\b/g, '$1') // Quita letras repetidas consecutivas (ej. "aaaa" -> "a")
        .replace(/\b(\w+)\s+\1\b/g, '$1') // Quita palabras repetidas consecutivas (ej. "hola hola" -> "hola")
        .trim(); // Quita espacios al inicio y final
}


const filtrarContenido = (req, res, next) => {
    const camposIgnorados = ['contrasena', 'password', 'token', 'correo', 'correocontacto', 'telcontacto'];

    // Extrae cualquier campo de texto que venga en la petición (resena, comentario, content, descripcion, etc.)
    const textos = Object.entries(req.body || {})
        .filter(([clave, valor]) => typeof valor === 'string' && !camposIgnorados.includes(clave.toLowerCase()))
        .map(([, valor]) => valor.trim())
        .filter(Boolean);

    if (textos.length === 0) return next();

    const textoCompleto = textos.join(' ');
    const textoNormalizado = normalizarTexto(textoCompleto);

    // 1. Detección de lenguaje ofensivo
    const contieneGroseria = PALABRAS_PROHIBIDAS.some((palabra) => {
        const regex = new RegExp(`\\b${palabra}\\b`, 'i');
        return regex.test(textoNormalizado);
    });

    if (contieneGroseria) {
        return res.status(400).json({
            message: 'Tu publicación contiene lenguaje ofensivo y fue bloqueada por el filtro automático.'
        });
    }

    // 2. Detección de spam por exceso de mayúsculas (>75%)
    const soloLetras = textoCompleto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
    if (soloLetras.length >= 12) {
        const mayusculas = soloLetras.replace(/[^A-ZÁÉÍÓÚÑ]/g, '').length;
        if (mayusculas / soloLetras.length > 0.75) {
            return res.status(400).json({
                message: 'Evita escribir todo en mayúsculas (detectado como posible spam).'
            });
        }
    }

    // 3. Detección de enlaces externos o repetición excesiva de caracteres
    if (/(https?:\/\/|www\.)/i.test(textoCompleto) || /(.)\1{5,}/.test(textoNormalizado)) {
        return res.status(400).json({
            message: 'No se permiten enlaces externos ni repetición excesiva de caracteres.'
        });
    }

    // 4. Control de frecuencia (máximo 3 publicaciones cada 3 minutos por usuario)
    const idUsuario = req.usuarioId || req.body.ID_Alumno || req.body.idAlumno;
    if (idUsuario) {
        const ahora = Date.now();
        const ventanaMs = 3 * 60 * 1000;
        const registro = historialUsuarios.get(idUsuario) || { timestamps: [], ultimoTexto: '' };

        registro.timestamps = registro.timestamps.filter((t) => ahora - t < ventanaMs);

        if (registro.ultimoTexto === textoNormalizado && registro.timestamps.length > 0) {
            return res.status(429).json({
                message: 'Ya enviaste exactamente este mismo texto hace un momento.'
            });
        }

        if (registro.timestamps.length >= 3) {
            return res.status(429).json({
                message: 'Estás publicando demasiado rápido. Espera un par de minutos.'
            });
        }

        registro.timestamps.push(ahora);
        registro.ultimoTexto = textoNormalizado;
        historialUsuarios.set(idUsuario, registro);
    }

    next();
};

module.exports = { filtrarContenido };