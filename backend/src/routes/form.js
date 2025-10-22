import express from 'express';
import { ensureUser, checkJwt } from '../middleware/auth.js';
import {
    createForm,
    updateForm,
    deleteForm,
    getAllForms,
    getFormByUrl,
    getFormById,
    getFormForDisplay,
    createFormResponse,
    updateFormResponse,
    getFormResponses,
    getFormResponsesById
} from '../controllers/form.js';

const router = express.Router();

router.post('/', checkJwt, ensureUser, createForm);
router.put('/:id', checkJwt, ensureUser, updateForm);
router.delete('/:id', checkJwt, ensureUser, deleteForm);
router.get('/my-forms', checkJwt, ensureUser, getAllForms);
router.get('/manage/:formUrl', checkJwt, ensureUser, getFormByUrl);
router.get('/edit/:formId', checkJwt, ensureUser, getFormById);
router.get('/responses/:formId', checkJwt, ensureUser, getFormResponsesById);

router.get('/display/:formUrl', getFormForDisplay);
router.post('/submit/:formUrl', createFormResponse);
router.put('/submit/:formUrl', updateFormResponse);
router.post('/responses/:formUrl', getFormResponses);

export default router;