const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

module.exports = async (req, res, next) => {
    console.log('[AuthMiddleware] v2.1 Processing request...');
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

        // Robust ID search
        let rawUserId = decodedToken.userId || decodedToken.id || decodedToken.sub;
        let companyId = decodedToken.companyId;
        let branchId = decodedToken.branchId;

        // Fallback for legacy tokens or missing primary fields
        if (!rawUserId || !companyId) {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: decodedToken.email },
                        { id: parseInt(rawUserId) || -1 }
                    ]
                },
                select: { id: true, companyId: true, branchId: true }
            });

            if (user) {
                rawUserId = user.id;
                companyId = companyId || user.companyId;
                branchId = branchId || user.branchId;
            }
        }

        const userId = parseInt(rawUserId);

        // STOPSHIP: Critical validation to prevent NaN propagating to business logic
        if (isNaN(userId)) {
            console.error('[AuthMiddleware] Critical: Could not resolve valid integer userId from token:', decodedToken);
            return res.status(401).json({ message: 'Sesión inválida o corrupta. Por favor, inicie sesión nuevamente.' });
        }

        req.user = {
            id: userId,
            userId: userId,
            role: decodedToken.role,
            email: decodedToken.email,
            companyId: parseInt(companyId),
            branchId: branchId ? parseInt(branchId) : null
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
