const prisma = require('../utils/prisma');

// GET /api/odontograms/:patientId — get last odontogram for patient
const getOdontogram = async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const companyId = parseInt(req.user.companyId);

        // Verify patient belongs to company
        const patient = await prisma.patient.findFirst({ where: { id: patientId, companyId } });
        if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

        const odontogram = await prisma.odontogram.findFirst({
            where: { patientId },
            orderBy: { updatedAt: 'desc' },
        });

        res.json(odontogram || null);
    } catch (error) {
        console.error('Error getOdontogram:', error);
        res.status(500).json({ message: 'Error al obtener odontograma', detail: error.message });
    }
};

// PUT /api/odontograms/:patientId — upsert odontogram (create or update)
const saveOdontogram = async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const companyId = parseInt(req.user.companyId);
        const doctorId = parseInt(req.user.id);
        const { data, logs } = req.body;

        if (!data) return res.status(400).json({ message: 'Se requiere el campo data' });

        // Verify patient belongs to company
        const patient = await prisma.patient.findFirst({ where: { id: patientId, companyId } });
        if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

        // Upsert odontogram
        const existing = await prisma.odontogram.findFirst({
            where: { patientId },
            orderBy: { updatedAt: 'desc' },
        });

        let odontogram;
        if (existing) {
            odontogram = await prisma.odontogram.update({
                where: { id: existing.id },
                data: { data },
            });
        } else {
            odontogram = await prisma.odontogram.create({
                data: { patientId, data },
            });
        }

        // Process logs if any
        if (logs && Array.isArray(logs) && logs.length > 0) {
            await prisma.odontogramLog.createMany({
                data: logs.map(log => ({
                    patientId,
                    toothNumber: log.toothNumber.toString(),
                    conditionId: log.conditionId || null,
                    action: log.action, // ADD, REMOVE, UPDATE_NOTE
                    description: log.description || null,
                    doctorId,
                }))
            });
        }

        res.json(odontogram);
    } catch (error) {
        console.error('Error saveOdontogram:', error);
        res.status(500).json({ message: 'Error al guardar odontograma', detail: error.message });
    }
};

const getToothHistory = async (req, res) => {
    try {
        const { patientId, toothNumber } = req.params;
        const history = await prisma.odontogramLog.findMany({
            where: {
                patientId: parseInt(patientId),
                toothNumber: toothNumber.toString(),
            },
            include: {
                doctor: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener historial', detail: error.message });
    }
};

// DELETE /api/odontograms/:patientId/reset — clear all findings
const resetOdontogram = async (req, res) => {
    try {
        const patientId = parseInt(req.params.patientId);
        const companyId = parseInt(req.user.companyId);

        const patient = await prisma.patient.findFirst({ where: { id: patientId, companyId } });
        if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

        await prisma.odontogram.deleteMany({ where: { patientId } });
        res.json({ message: 'Odontograma reiniciado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al reiniciar odontograma', detail: error.message });
    }
};

module.exports = { getOdontogram, saveOdontogram, resetOdontogram, getToothHistory };
