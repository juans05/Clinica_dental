const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/templates', authMiddleware, consentController.getTemplates);
router.post('/templates', authMiddleware, consentController.createTemplate);
router.get('/patient/:patientId', authMiddleware, consentController.getPatientConsents);
router.post('/sign', authMiddleware, consentController.signConsent);
router.post('/upload/:patientId/:templateId', authMiddleware, upload.single('file'), consentController.uploadConsentFile);

module.exports = router;
