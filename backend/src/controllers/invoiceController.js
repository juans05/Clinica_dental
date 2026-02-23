const prisma = require('../utils/prisma');

const createInvoice = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { number, type, total, patientId, treatmentPlanId } = req.body;

        if (!number || !total || !patientId) {
            return res.status(400).json({ message: 'Campos requeridos: number, total, patientId' });
        }

        const invoice = await prisma.invoice.create({
            data: {
                number,
                type: type || 'BOLETA',
                total: parseFloat(total),
                patientId: parseInt(patientId),
                companyId: parseInt(companyId),
                treatmentPlanId: treatmentPlanId ? parseInt(treatmentPlanId) : null,
                status: 'PAID'
            }
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Error al crear la boleta', error: error.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const { companyId } = req.user;
        const invoices = await prisma.invoice.findMany({
            where: { companyId: parseInt(companyId) },
            orderBy: { createdAt: 'desc' },
            include: {
                treatmentPlan: true
            }
        });
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error al obtener boletas' });
    }
};

module.exports = {
    createInvoice,
    getInvoices
};
