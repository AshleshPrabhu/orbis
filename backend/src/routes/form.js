import express from 'express';
import { ensureUser } from '../middleware/auth.js';
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

router.post('/', ensureUser, createForm);
router.put('/:id', ensureUser, updateForm);
router.delete('/:id', ensureUser, deleteForm);
router.get('/my-forms', ensureUser, getAllForms);
router.get('/manage/:formUrl', ensureUser, getFormByUrl);
router.get('/display/:formUrl', getFormForDisplay);
router.post('/submit/:formUrl', createFormResponse);
router.put('/submit/:formUrl', updateFormResponse);
router.post('/responses/:formUrl', getFormResponses);

export default router;