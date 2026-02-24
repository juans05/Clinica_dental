const express = require('express');
const router = express.Router();
const patientFileController = require('../controllers/patientFileController');
const { upload } = require('../config/cloudinary');

router.get('/:patientId', patientFileController.getPatientFiles);
router.post('/:patientId/upload', upload.single('file'), patientFileController.uploadPatientFile);
router.delete('/:id', patientFileController.deletePatientFile);

module.exports = router;
