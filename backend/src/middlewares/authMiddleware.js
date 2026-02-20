const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No autenticado. Token faltante.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role,
            email: decodedToken.email
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
