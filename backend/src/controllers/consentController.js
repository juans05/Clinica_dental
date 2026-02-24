const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTemplates = async (req, res) => {
    try {
        const templates = await prisma.consentTemplate.findMany({
            where: { companyId: req.user.companyId, active: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener plantillas', detail: error.message });
    }
};

const createTemplate = async (req, res) => {
    try {
        const { title, content } = req.body;
        const template = await prisma.consentTemplate.create({
            data: {
                title,
                content,
                companyId: req.user.companyId
            }
        });
        res.json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear plantilla', detail: error.message });
    }
};

const getPatientConsents = async (req, res) => {
    try {
        const { patientId } = req.params;
        const consents = await prisma.patientConsent.findMany({
            where: { patientId: parseInt(patientId) },
            include: { template: true },
            orderBy: { signedAt: 'desc' }
        });
        res.json(consents);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener consentimientos', detail: error.message });
    }
};

const signConsent = async (req, res) => {
    try {
        const { patientId, templateId, signature } = req.body;
        const consent = await prisma.patientConsent.create({
            data: {
                patientId: parseInt(patientId),
                templateId: parseInt(templateId),
                signature
            },
            include: { template: true }
        });
        res.json(consent);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar firma', detail: error.message });
    }
};

const uploadConsentFile = async (req, res) => {
    try {
        const { patientId, templateId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        const consent = await prisma.patientConsent.create({
            data: {
                patientId: parseInt(patientId),
                templateId: parseInt(templateId),
                fileUrl: req.file.path // Cloudinary URL
            },
            include: { template: true }
        });

        res.json(consent);
    } catch (error) {
        console.error('Error uploadConsentFile:', error);
        res.status(500).json({ message: 'Error al subir archivo de consentimiento', detail: error.message });
    }
};

module.exports = {
    getTemplates,
    createTemplate,
    getPatientConsents,
    signConsent,
    uploadConsentFile
};
