const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const branchRoutes = require('./branchRoutes');
const serviceRoutes = require('./serviceRoutes');
const treatmentRoutes = require('./treatmentRoutes');
const odontogramRoutes = require('./odontogramRoutes');
const clinicalRoutes = require('./clinicalRoutes');

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/branches', branchRoutes);
router.use('/services', serviceRoutes);
router.use('/treatments', treatmentRoutes);
router.use('/odontograms', odontogramRoutes);
router.use('/clinical', clinicalRoutes);

module.exports = router;
