const prisma = require('../utils/prisma');

const getPatients = async (req, res) => {
    try {
        const { companyId } = req.user;
        const patients = await prisma.patient.findMany({
            where: {
                companyId,
                active: true // Only show active patients by default
            },
            include: {
                appointments: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            }
        });
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener pacientes' });
    }
};

const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;
        const patient = await prisma.patient.findFirst({
            where: {
                id: parseInt(id),
                companyId,
                active: true
            },
            include: {
                appointments: true,
                odontograms: true
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }
        res.json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el paciente' });
    }
};

const createPatient = async (req, res) => {
    try {
        const { companyId } = req.user;

        if (!companyId) {
            return res.status(400).json({ message: 'Error: El usuario no tiene una compañía asociada.' });
        }

        const {
            firstName,
            paternalSurname,
            maternalSurname,
            documentType,
            documentId,
            nationality,
            birthDate,
            gender,
            civilStatus,
            phoneMobile,
            phoneHome,
            email,
            webUser,
            webPassword,
            whatsappEnabled,
            ubigeoAddress,
            ubigeoCode,
            address,
            reference,
            medicalHistory
        } = req.body;

        const lastName = `${paternalSurname || ''} ${maternalSurname || ''}`.trim();

        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName: lastName || 'Paciente',
                paternalSurname,
                maternalSurname,
                documentType,
                documentId,
                nationality,
                birthDate: new Date(birthDate),
                gender,
                civilStatus,
                phoneMobile,
                phoneHome,
                email,
                webUser,
                webPassword,
                whatsappEnabled: whatsappEnabled === undefined ? true : whatsappEnabled,
                ubigeoAddress,
                ubigeoCode,
                address,
                reference,
                medicalHistory,
                active: true,
                company: { connect: { id: parseInt(companyId) } }
            }
        });

        res.status(201).json(patient);
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ message: 'Error al crear paciente', error: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;
        const data = req.body;

        if (data.paternalSurname || data.maternalSurname) {
            data.lastName = `${data.paternalSurname || ''} ${data.maternalSurname || ''}`.trim();
        }

        const patient = await prisma.patient.updateMany({
            where: {
                id: parseInt(id),
                companyId
            },
            data: {
                ...data,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                updatedAt: new Date()
            }
        });

        if (patient.count === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado o inaccesible' });
        }

        res.json({ message: 'Paciente actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar paciente' });
    }
};

const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;

        const patient = await prisma.patient.updateMany({
            where: {
                id: parseInt(id),
                companyId
            },
            data: {
                active: false
            }
        });

        if (patient.count === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        res.json({ message: 'Paciente desactivado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al desactivar paciente' });
    }
};

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
};
