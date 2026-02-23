const prisma = require('../utils/prisma');

// GET /api/treatments?patientId=X
const getTreatmentPlans = async (req, res) => {
    try {
        const companyId = parseInt(req.user.companyId);
        const { patientId } = req.query;

        const where = {};
        if (patientId) where.patientId = parseInt(patientId);
        // Scope to company via patient
        if (patientId) {
            const patient = await prisma.patient.findFirst({ where: { id: parseInt(patientId), companyId } });
            if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        const plans = await prisma.treatmentPlan.findMany({
            where,
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, firstName: true, paternalSurname: true } },
                items: {
                    include: {
                        service: { select: { id: true, name: true, category: true } },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(plans);
    } catch (error) {
        console.error('Error getTreatmentPlans:', error);
        res.status(500).json({ message: 'Error al obtener planes', detail: error.message });
    }
};

// GET /api/treatments/:id
const getTreatmentPlanById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const plan = await prisma.treatmentPlan.findUnique({
            where: { id },
            include: {
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, firstName: true, paternalSurname: true, documentId: true } },
                items: {
                    include: { service: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!plan) return res.status(404).json({ message: 'Plan de tratamiento no encontrado' });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener plan', detail: error.message });
    }
};

// POST /api/treatments
const createTreatmentPlan = async (req, res) => {
    try {
        const { patientId, doctorId, notes, items } = req.body;

        if (!patientId || !doctorId) {
            return res.status(400).json({ message: 'Campos requeridos: patientId, doctorId' });
        }

        const plan = await prisma.treatmentPlan.create({
            data: {
                patientId: parseInt(patientId),
                doctorId: parseInt(doctorId),
                notes: notes || null,
                items: items && items.length > 0 ? {
                    create: items.map(item => ({
                        serviceId: parseInt(item.serviceId),
                        toothNumber: item.toothNumber || null,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity) || 1,
                        notes: item.notes || null,
                    })),
                } : undefined,
            },
            include: {
                items: { include: { service: true } },
                doctor: { select: { id: true, name: true } },
                patient: { select: { id: true, firstName: true, paternalSurname: true } },
            },
        });
        res.status(201).json(plan);
    } catch (error) {
        console.error('Error createTreatmentPlan:', error);
        res.status(500).json({ message: 'Error al crear plan', detail: error.message });
    }
};

// PATCH /api/treatments/:id — update plan status/notes
const updateTreatmentPlan = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, notes } = req.body;

        const plan = await prisma.treatmentPlan.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
            },
        });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar plan', detail: error.message });
    }
};

// POST /api/treatments/:id/items — add item to existing plan
const addTreatmentItem = async (req, res) => {
    try {
        const treatmentPlanId = parseInt(req.params.id);
        const { serviceId, toothNumber, price, notes, appointmentId, quantity } = req.body;

        if (!serviceId || price === undefined) {
            return res.status(400).json({ message: 'Campos requeridos: serviceId, price' });
        }

        const item = await prisma.treatmentItem.create({
            data: {
                treatmentPlanId,
                serviceId: parseInt(serviceId),
                toothNumber: toothNumber || null,
                price: parseFloat(price),
                quantity: parseInt(quantity) || 1,
                notes: notes || null,
                appointmentId: appointmentId ? parseInt(appointmentId) : null,
            },
            include: { service: true },
        });
        res.status(201).json(item);
    } catch (error) {
        console.error('Error addTreatmentItem:', error);
        res.status(500).json({ message: 'Error al agregar ítem', detail: error.message });
    }
};

// PATCH /api/treatments/items/:itemId — update item status
const updateTreatmentItem = async (req, res) => {
    try {
        const id = parseInt(req.params.itemId);
        const { status, notes, price, toothNumber, appointmentId, quantity } = req.body;

        const item = await prisma.treatmentItem.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { notes }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(quantity !== undefined && { quantity: parseInt(quantity) }),
                ...(toothNumber !== undefined && { toothNumber }),
                ...(appointmentId !== undefined && { appointmentId: appointmentId ? parseInt(appointmentId) : null }),
            },
            include: { service: true },
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar ítem', detail: error.message });
    }
};

// DELETE /api/treatments/items/:itemId
const deleteTreatmentItem = async (req, res) => {
    try {
        const id = parseInt(req.params.itemId);
        await prisma.treatmentItem.delete({ where: { id } });
        res.json({ message: 'Ítem eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar ítem', detail: error.message });
    }
};

module.exports = {
    getTreatmentPlans,
    getTreatmentPlanById,
    createTreatmentPlan,
    updateTreatmentPlan,
    addTreatmentItem,
    updateTreatmentItem,
    deleteTreatmentItem,
};
