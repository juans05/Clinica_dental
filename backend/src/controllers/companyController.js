const prisma = require('../utils/prisma');

const getCompany = async (req, res) => {
    try {
        const companyId = parseInt(req.user.companyId);
        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });
        res.json(company);
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ message: 'Error al obtener datos de la empresa', error: error.message });
    }
};

const updateCompany = async (req, res) => {
    try {
        const companyId = parseInt(req.user.companyId);
        const { commercialName, phone, address, receptionEmail, logo, website, description } = req.body;

        const company = await prisma.company.update({
            where: { id: companyId },
            data: {
                commercialName,
                phone,
                address,
                receptionEmail,
                logo,
                website,
                description
            }
        });

        res.json(company);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ message: 'Error al actualizar datos de la empresa', error: error.message });
    }
};

module.exports = {
    getCompany,
    updateCompany
};
