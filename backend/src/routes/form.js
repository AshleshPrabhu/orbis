import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    createForm,
    updateForm,
    deleteForm,
    getAllForms,
    getFormByUrl,
    getFormForDisplay,
    createFormResponse,
    updateFormResponse,
    getFormResponses
} from '../controllers/form.js';

const router = express.Router();

router.post('/', authenticateToken, createForm);
router.put('/:id', authenticateToken, updateForm);
router.delete('/:id', authenticateToken, deleteForm);
router.get('/my-forms', authenticateToken, getAllForms);
router.get('/manage/:formUrl', authenticateToken, getFormByUrl);
router.get('/display/:formUrl', getFormForDisplay);
router.post('/submit/:formUrl', createFormResponse);
router.put('/submit/:formUrl', updateFormResponse);
router.post('/responses/:formUrl', getFormResponses);

export default router;