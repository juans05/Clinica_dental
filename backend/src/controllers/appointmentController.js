const prisma = require('../utils/prisma');

const getAppointments = async (req, res) => {
    try {
        const { companyId, branchId } = req.user;
        const { start, end, doctorId, branchId: queryBranchId, patientId } = req.query;

        const where = { branch: { companyId } };

        if (queryBranchId) {
            where.branchId = parseInt(queryBranchId);
        } else if (branchId && req.user.role !== 'ADMIN') {
            where.branchId = parseInt(branchId);
        }

        if (start && end) {
            where.date = { gte: new Date(start), lte: new Date(end) };
        }

        if (doctorId) {
            where.doctorId = parseInt(doctorId);
        }

        if (patientId) {
            where.patientId = parseInt(patientId);
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                patient: {
                    select: { id: true, firstName: true, paternalSurname: true, maternalSurname: true, phoneMobile: true }
                },
                doctor: {
                    select: { id: true, name: true, role: true }
                },
                treatmentItems: {
                    include: {
                        service: {
                            select: { id: true, name: true, category: true, price: true }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });

        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error al obtener citas', error: error.message });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { branchId } = req.user;
        const { date, notes, patientId, doctorId, reason, urgency, duration } = req.body;

        if (!branchId) {
            return res.status(400).json({ message: 'El usuario debe estar asociado a una sede para crear citas.' });
        }
        if (!patientId || !doctorId || !date) {
            return res.status(400).json({ message: 'Campos requeridos: fecha, paciente, doctor.' });
        }

        const appointmentDate = new Date(date);
        const appDuration = duration ? parseInt(duration) : 30;
        const endTime = new Date(appointmentDate.getTime() + appDuration * 60000);

        // Check for overlaps with the same doctor
        const overlap = await prisma.appointment.findFirst({
            where: {
                doctorId: parseInt(doctorId),
                branchId: parseInt(branchId),
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
                OR: [
                    {
                        // New appointment starts during an existing one
                        date: { lte: appointmentDate },
                        // This logic assumes end time = date + duration
                        // Since we don't store endTime explicitly, we calculate it on the fly or simplify
                    }
                ]
            }
        });

        // Refined overlap check: 
        // An overlap exists if: (startA < endB) AND (endA > startB)
        const allPotentialOverlaps = await prisma.appointment.findMany({
            where: {
                doctorId: parseInt(doctorId),
                branchId: parseInt(branchId),
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
                date: {
                    gte: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000), // Check within 24h
                    lte: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const isOverlapping = allPotentialOverlaps.some(app => {
            const startB = new Date(app.date);
            const endB = new Date(startB.getTime() + (app.duration || 30) * 60000);
            return (appointmentDate < endB) && (endTime > startB);
        });

        if (isOverlapping) {
            return res.status(409).json({ message: 'El doctor ya tiene una cita programada en este horario.' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                date: appointmentDate,
                notes: notes || null,
                reason: reason || null,
                urgency: urgency || 'NORMAL',
                duration: appDuration,
                patientId: parseInt(patientId),
                doctorId: parseInt(doctorId),
                branchId: parseInt(branchId),
                status: 'SCHEDULED'
            },
            include: {
                patient: { select: { id: true, firstName: true, paternalSurname: true } },
                doctor: { select: { id: true, name: true } }
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ message: 'Error al crear la cita', error: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, notes, status, doctorId, reason, urgency, duration } = req.body;

        const appointmentId = parseInt(id);
        const existingApp = await prisma.appointment.findUnique({ where: { id: appointmentId } });

        if (!existingApp) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        const newDate = date ? new Date(date) : new Date(existingApp.date);
        const newDuration = duration ? parseInt(duration) : (existingApp.duration || 30);
        const newDoctorId = doctorId ? parseInt(doctorId) : existingApp.doctorId;
        const newEndTime = new Date(newDate.getTime() + newDuration * 60000);

        // Check for overlaps (excluding current appointment)
        const allPotentialOverlaps = await prisma.appointment.findMany({
            where: {
                id: { not: appointmentId },
                doctorId: newDoctorId,
                branchId: existingApp.branchId,
                status: { in: ['SCHEDULED', 'CONFIRMED'] },
                date: {
                    gte: new Date(newDate.getTime() - 24 * 60 * 60 * 1000),
                    lte: new Date(newDate.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const isOverlapping = allPotentialOverlaps.some(app => {
            const startB = new Date(app.date);
            const endB = new Date(startB.getTime() + (app.duration || 30) * 60000);
            return (newDate < endB) && (newEndTime > startB);
        });

        if (isOverlapping) {
            return res.status(409).json({ message: 'El doctor ya tiene una cita programada en este horario.' });
        }

        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                ...(date && { date: newDate }),
                ...(notes !== undefined && { notes }),
                ...(status && { status }),
                ...(doctorId && { doctorId: newDoctorId }),
                ...(reason !== undefined && { reason }),
                ...(urgency && { urgency }),
                ...(duration && { duration: newDuration }),
                updatedAt: new Date()
            }
        });

        res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ message: 'Error al actualizar la cita', error: error.message });
    }
};

const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Cita eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ message: 'Error al eliminar la cita', error: error.message });
    }
};

// PUT /api/appointments/:id/attend
// Marks appointment as ATTENDED and saves services performed (TreatmentItems)
const attendAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { services, notes } = req.body;
        // services: [{ serviceId, toothNumber?, notes?, price? }]

        const appointmentId = parseInt(id);

        // Verify appointment exists
        const existing = await prisma.appointment.findUnique({
            where: { id: appointmentId }
        });
        if (!existing) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }

        // Run in a transaction: update status + replace treatmentItems
        const result = await prisma.$transaction(async (tx) => {
            // 1. Delete previous treatment items for this appointment
            await tx.treatmentItem.deleteMany({
                where: { appointmentId }
            });

            // 2. Update appointment status and notes
            const updated = await tx.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: 'ATTENDED',
                    ...(notes !== undefined && { notes }),
                    updatedAt: new Date()
                }
            });

            // 3. Create new treatment items if any services provided
            if (services && services.length > 0) {
                // Fetch prices for services not overriding
                const serviceIds = services.map(s => s.serviceId);
                const catalog = await tx.service.findMany({
                    where: { id: { in: serviceIds } },
                    select: { id: true, price: true }
                });
                const priceMap = Object.fromEntries(catalog.map(s => [s.id, s.price]));

                await tx.treatmentItem.createMany({
                    data: services.map(s => ({
                        serviceId: s.serviceId,
                        toothNumber: s.toothNumber || null,
                        notes: s.notes || null,
                        price: s.price !== undefined ? s.price : (priceMap[s.serviceId] || 0),
                        status: 'COMPLETED',
                        appointmentId,
                        // No treatmentPlanId — this is a standalone visit service
                        treatmentPlanId: s.treatmentPlanId || null
                    }))
                });
            }

            return updated;
        });

        // Return updated appointment with items
        const full = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: { select: { id: true, firstName: true, paternalSurname: true } },
                doctor: { select: { id: true, name: true } },
                treatmentItems: {
                    include: {
                        service: { select: { id: true, name: true, category: true, price: true } }
                    }
                }
            }
        });

        res.json(full);
    } catch (error) {
        console.error('Error attending appointment:', error);
        res.status(500).json({ message: 'Error al registrar la atención', error: error.message });
    }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment, attendAppointment };
