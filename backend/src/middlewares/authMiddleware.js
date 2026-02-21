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

        let companyId = decodedToken.companyId;
        let branchId = decodedToken.branchId;

        // Fallback for legacy tokens that don't have companyId/branchId
        if (!companyId) {
            const user = await prisma.user.findUnique({
                where: { id: decodedToken.userId },
                select: { companyId: true, branchId: true }
            });
            if (user) {
                companyId = user.companyId;
                branchId = user.branchId;
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
