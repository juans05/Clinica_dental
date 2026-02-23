const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
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
        console.log('Decoded Token:', decodedToken);

        let companyId = decodedToken.companyId;
        let branchId = decodedToken.branchId;

        // Fallback for legacy tokens that don't have companyId/branchId
        if (!companyId) {
            console.log('No companyId in token, fetching from DB for user:', decodedToken.userId);
            const user = await prisma.user.findUnique({
                where: { id: decodedToken.userId },
                select: { companyId: true, branchId: true }
            });
            if (user) {
                console.log('Found user in DB, companyId:', user.companyId);
                companyId = user.companyId;
                branchId = user.branchId;
            } else {
                console.log('User not found in DB for fallback!');
            }
        }

        req.user = {
            userId: decodedToken.userId,
            role: decodedToken.role,
            email: decodedToken.email,
            companyId,
            branchId
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
