const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// POST /api/clinical/forms - Save or Update
router.post('/forms', clinicalController.saveForm);

// GET /api/clinical/forms/:patientId/:type - Retrieve
router.get('/forms/:patientId/:type', clinicalController.getForm);

module.exports = router;
