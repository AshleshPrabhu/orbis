import prisma from '../config/database.js';
import crypto from 'crypto';

const ensureAuth = (req) => {
    if (!req.user || !req.user.id) {
        const error = new Error('Unauthorized: User not found');
        error.status = 401;
        throw error;
    }
    return req.user;
};

function validateFieldRules(field) {
    const { fieldType, validation } = field;

    if (!validation) return true; 

    let rules = typeof validation === "string" ? JSON.parse(validation) : validation;

    switch (fieldType) {
        case "TEXT":
            if (rules.minLength && typeof rules.minLength !== "number") throw Error("minLength must be a number");
            if (rules.maxLength && typeof rules.maxLength !== "number") throw Error("maxLength must be a number");
            break;
        case "NUMBER":
            if (rules.min && typeof rules.min !== "number") throw Error("min must be a number");
            if (rules.max && typeof rules.max !== "number") throw Error("max must be a number");
            break;
        case "EMAIL":
            if (rules.pattern && typeof rules.pattern !== "string") throw Error("pattern must be a string regex");
            break;
        case "FILE":
            if (rules.allowedTypes && !Array.isArray(rules.allowedTypes)) throw Error("allowedTypes must be array");
            if (rules.maxSizeMB && typeof rules.maxSizeMB !== "number") throw Error("maxSizeMB must be number");
            break;
        case "STAR_RATING":
            if (rules.maxStars && typeof rules.maxStars !== "number") throw Error("maxStars must be number");
            break;
    }

    return true;
}

function validateFieldConditions(field, allFields) {
    const { conditions } = field;
    if (!conditions) return true;

    const cond = typeof conditions === "string" ? JSON.parse(conditions) : conditions;

    if (!cond.dependsOn || !cond.showIf) throw Error("Condition must have dependsOn and showIf");
    const dependentField = allFields.find(f => f.id === cond.dependsOn);
    if (!dependentField) throw Error(`Condition dependsOn invalid field: ${cond.dependsOn}`);

    const validOps = ["equals", "notequals", "greaterthan", "lessthan","exists","notexists"];
    for (const op of Object.keys(cond.showIf)) {
        if (!validOps.includes(op.toLowerCase())) throw Error(`Invalid operator in showIf: ${op}`);
    }

    return true;
}

export const createForm = async (req,res)=>{
    try {
        const user = ensureAuth(req);
        const {
            title,
            description,
            isEditable=false,
            fields=[],
            contributors=[]
        } = req.body;

        if(fields.length != 0){
            for (const field of fields) {
                if(!field.fieldType || !field.label ||!field.position){
                    return res.status(400).json({ error: "Each field must have 'fieldType' , 'label' and 'position'." });
                }
                // Validate field type
                const validFieldTypes = ["TEXT", "NUMBER", "EMAIL", "MULTIPLE_CHOICE", "CHECKBOX", "SINGLE_CHOICE", "FILE", "DATE", "STAR_RATING", "DROPDOWN"];
                if (!validFieldTypes.includes(field.fieldType)) {
                    return res.status(400).json({ error: `Invalid field type: ${field.fieldType}` });
                }

                if (field.fieldType === "MULTIPLE_CHOICE" || field.fieldType === "DROPDOWN" || field.fieldType === "CHECKBOX" || field.fieldType === "SINGLE_CHOICE") {

                    let options = field.options;

                    if (typeof options === "string") {
                        try {
                            options = JSON.parse(options);
                        } catch (err) {
                            return res.status(400).json({ error: "Invalid JSON in field options." });
                        }
                    }

                    if (!Array.isArray(options) || options.length < 2) {
                        return res.status(400).json({ error: "Multiple choice fields must have at least two options." });
                    }

                    for (const opt of options) {
                        if (!opt.label || !opt.value) {
                            return res.status(400).json({ error: "Each option must have 'label' and 'value'." });
                        }
                    }
                }
                if(!validateFieldRules(field)){
                    return res.status(400).json({ error: "Invalid field validation rules." });
                }
                if(!validateFieldConditions(field, fields)){
                    return res.status(400).json({ error: "Invalid field conditions." });
                }
            }
        }

        if(contributors.length!=0){
            for(const contributor of contributors){
                if(!contributor.userId || !contributor.permission){
                    return res.status(400).json({ error: "Each contributor must have 'userId' and 'permission'." });
                }
                if(!["VIEW","EDIT"].includes(contributor.permission)){
                    return res.status(400).json({ error: "Contributor permission must be either 'VIEW' or 'EDIT'." });
                }
            }
        }
        const formUrl = crypto.randomBytes(6).toString('hex').toUpperCase();
        
        const formData = await prisma.$transaction(async (tx) => {
            const form = await tx.form.create({
                data: { 
                    title, 
                    description, 
                    createdBy: user.id, 
                    formUrl, 
                    isEditable,
                    isActive: true // Ensure form is active by default
                },
            });

            if (fields.length > 0) {
                const fieldsData = fields.map(f => ({
                    formId: form.id,
                    label: f.label,
                    fieldType: f.fieldType,
                    position: f.position,
                    placeholder: f.placeholder || null,
                    isRequired: f.isRequired || false,
                    allowMultiple: f.allowMultiple || false,
                    helpText: f.helpText || null,
                    options: f.options ? (typeof f.options === "string" ? JSON.parse(f.options) : f.options) : null,
                    validation: f.validation ? (typeof f.validation === "string" ? JSON.parse(f.validation) : f.validation) : null,
                    conditions: f.conditions ? (typeof f.conditions === "string" ? JSON.parse(f.conditions) : f.conditions) : null,
                }));

                await tx.formField.createMany({ data: fieldsData });
            }

            if (contributors.length > 0) {
                const contributorsData = contributors.map(c => ({
                formId: form.id,
                userId: c.userId,
                permission: c.permission,
                }));

                await tx.formContributor.createMany({ data: contributorsData });
            }

            return form;
        });

        // Generate full form URL for sharing
        const fullFormUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/form/${formData.formUrl}`;

        res.status(201).json({
            success: true,
            message: "Form created successfully",
            data: {
                id: formData.id,
                title: formData.title,
                description: formData.description,
                formUrl: formData.formUrl,
                fullUrl: fullFormUrl,
                isActive: formData.isActive,
                createdAt: formData.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating form:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create form',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

export const updateForm = async (req, res) => {
    try {
        const user = ensureAuth(req);
        const { id } = req.params;
        const { title, description, fields = [], contributors = [], isActive, isEditable } = req.body;

        const existingForm = await prisma.form.findUnique({
            where: { id },
            include: {
                contributors: true,
                fields: { include: { answers: true } },
            },
        });

        if (!existingForm) return res.status(404).json({ error: 'Form not found' });
        if (!existingForm.isActive) return res.status(400).json({ error: 'Cannot edit an inactive form' });

        const isOwner = existingForm.createdBy === user.id;
        const canEdit = existingForm.contributors.some(c => c.userId === user.id && c.permission === 'EDIT');
        if (!isOwner && !canEdit) return res.status(403).json({ error: 'Permission denied' });

        for (const field of fields) {
            if (!field.label || !field.fieldType || field.position === undefined)
                return res.status(400).json({ error: "Each field must have 'label', 'fieldType' and 'position'" });

            if (["MULTIPLE_CHOICE", "SINGLE_CHOICE", "DROPDOWN", "CHECKBOX"].includes(field.fieldType)) {
                let options = field.options;
                if (typeof options === "string") options = JSON.parse(options);
                if (!Array.isArray(options) || options.length < 2)
                return res.status(400).json({ error: 'Choice fields must have at least 2 options' });
                for (const opt of options) if (!opt.label || !opt.value)
                return res.status(400).json({ error: "Each option must have 'label' and 'value'" });
            }

            if (!validateFieldRules(field)) return res.status(400).json({ error: 'Invalid validation rules' });
            if (!validateFieldConditions(field, fields)) return res.status(400).json({ error: 'Invalid conditions' });
        }

        for (const contributor of contributors) {
            if (!contributor.userId || !contributor.permission)
                return res.status(400).json({ error: "Each contributor must have 'userId' and 'permission'" });
            if (!["VIEW", "EDIT"].includes(contributor.permission))
                return res.status(400).json({ error: "Contributor permission must be either 'VIEW' or 'EDIT'" });
        }

        await prisma.$transaction(async (tx) => {
            const updateData = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (isEditable !== undefined) updateData.isEditable = isEditable;
            if (Object.keys(updateData).length > 0) {
                await tx.form.update({ where: { id }, data: updateData });
            }

            const existingFieldsMap = new Map(existingForm.fields.map(f => [f.label, f]));

            const fieldsToCreate = [];
            const fieldsToUpdate = [];
            const fieldIdsToDelete = [];

            for (const field of fields) {
                const existingField = existingFieldsMap.get(field.label);
                if (existingField) {
                    const updateData = {};
                    if (existingField.position !== field.position) updateData.position = field.position;
                    if (existingField.placeholder !== field.placeholder) updateData.placeholder = field.placeholder || null;
                    if (existingField.isRequired !== field.isRequired) updateData.isRequired = field.isRequired || false;
                    if (existingField.allowMultiple !== field.allowMultiple) updateData.allowMultiple = field.allowMultiple || false;
                    if (existingField.helpText !== field.helpText) updateData.helpText = field.helpText || null;
                    if (JSON.stringify(existingField.options) !== JSON.stringify(field.options))
                        updateData.options = typeof field.options === "string" ? JSON.parse(field.options) : field.options;
                    if (JSON.stringify(existingField.validation) !== JSON.stringify(field.validation))
                        updateData.validation = typeof field.validation === "string" ? JSON.parse(field.validation) : field.validation;
                    if (JSON.stringify(existingField.conditions) !== JSON.stringify(field.conditions))
                        updateData.conditions = typeof field.conditions === "string" ? JSON.parse(field.conditions) : field.conditions;

                    if (Object.keys(updateData).length > 0) {
                        fieldsToUpdate.push({ id: existingField.id, data: updateData });
                    }

                    existingFieldsMap.delete(field.label);
                } else {
                    fieldsToCreate.push({
                        formId: id,
                        label: field.label,
                        fieldType: field.fieldType,
                        position: field.position,
                        placeholder: field.placeholder || null,
                        isRequired: field.isRequired || false,
                        allowMultiple: field.allowMultiple || false,
                        helpText: field.helpText || null,
                        options: field.options ? (typeof field.options === "string" ? JSON.parse(field.options) : field.options) : null,
                        validation: field.validation ? (typeof field.validation === "string" ? JSON.parse(field.validation) : field.validation) : null,
                        conditions: field.conditions ? (typeof field.conditions === "string" ? JSON.parse(field.conditions) : field.conditions) : null,
                    });
                }
            }

            for (const [_, fieldToDelete] of existingFieldsMap) {
                fieldIdsToDelete.push(fieldToDelete.id);
            }

            if (fieldsToCreate.length > 0) await tx.formField.createMany({ data: fieldsToCreate });

            for (const f of fieldsToUpdate) {
                await tx.formField.update({ where: { id: f.id }, data: f.data });
            }

            if (fieldIdsToDelete.length > 0) {
                await tx.fieldAnswer.deleteMany({ where: { fieldId: { in: fieldIdsToDelete } } });
                await tx.formField.deleteMany({ where: { id: { in: fieldIdsToDelete } } });
            }

            
            const existingContributorsMap = new Map(existingForm.contributors.map(c => [c.userId, c]));
            const contributorsToCreate = [];
            const contributorsToUpdate = [];
            const contributorIdsToDelete = [];

            for (const contributor of contributors) {
            const existingContributor = existingContributorsMap.get(contributor.userId);
            if (existingContributor) {
                if (existingContributor.permission !== contributor.permission)
                contributorsToUpdate.push({ id: existingContributor.id, permission: contributor.permission });
                existingContributorsMap.delete(contributor.userId);
            } else {
                contributorsToCreate.push({ formId: id, userId: contributor.userId, permission: contributor.permission });
            }
            }

            for (const [_, cToDelete] of existingContributorsMap) contributorIdsToDelete.push(cToDelete.id);

            if (contributorsToCreate.length > 0) await tx.formContributor.createMany({ data: contributorsToCreate });

            for (const c of contributorsToUpdate)
            await tx.formContributor.update({ where: { id: c.id }, data: { permission: c.permission } });

            if (contributorIdsToDelete.length > 0)
            await tx.formContributor.deleteMany({ where: { id: { in: contributorIdsToDelete } } });
            
        });

        res.status(200).json({ 
            success: true,
            message: 'Form updated successfully' 
        });
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update form',
            message: error.message
        });
    }
};

export const deleteForm = async (req, res) => {
    try {
        const user = ensureAuth(req);
        const { id } = req.params;

        const form = await prisma.form.findUnique({
            where: { id },
            include: {
                fields: { include: { answers: true } },
                responses: { include: { answers: true } },
            },
        });

        if (!form) return res.status(404).json({ error: 'Form not found' });
        if (form.createdBy !== user.id) {
            return res.status(403).json({ error: 'Permission denied. Only the creator can delete this form.' });
        }

        await prisma.$transaction(async (tx) => {
            const fieldIds = form.fields.map(f => f.id);
            const responseIds = form.responses.map(r => r.id);

            if (fieldIds.length > 0) {
                await tx.fieldAnswer.deleteMany({ where: { fieldId: { in: fieldIds } } });
            }

            if (responseIds.length > 0) {
                await tx.fieldAnswer.deleteMany({ where: { responseId: { in: responseIds } } });
            }

            if (responseIds.length > 0) {
                await tx.formResponse.deleteMany({ where: { id: { in: responseIds } } });
            }

            if (fieldIds.length > 0) {
                await tx.formField.deleteMany({ where: { id: { in: fieldIds } } });
            }

            await tx.formContributor.deleteMany({ where: { formId: id } });

            await tx.form.delete({ where: { id } });
        });

        res.status(200).json({ 
            success: true,
            message: 'Form and all associated data deleted successfully' 
        });
    } catch (error) {
        console.error('Delete form error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete form',
            message: error.message
        });
    }
};

export const getAllForms = async (req, res) => {
    try {
        const user = ensureAuth(req);
        const forms = await prisma.form.findMany({
            where: {
                OR: [  
                    { createdBy: user.id },
                    { contributors: { some: { userId: user.id } } }
                ]
            },
            include: {
                fields: {
                    select: {
                        id: true,
                        label: true,
                        fieldType: true,
                        isRequired: true
                    }
                },
                responses: {
                    select: {
                        id: true,
                        submittedAt: true
                    }
                },
                contributors: {
                    select: {
                        userId: true,
                        permission: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Format response to include computed fields
        const formattedForms = forms.map(form => ({
            ...form,
            fieldsCount: form.fields.length,
            responsesCount: form.responses.length,
            isOwner: form.createdBy === user.id
        }));

        res.status(200).json({
            success: true,
            data: formattedForms
        });
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch forms',
            message: error.message
        });
    }
}

export const getFormByUrl = async (req, res) => {
    try {
        const { formUrl } = req.params;
        const user = ensureAuth(req);

        const form = await prisma.form.findUnique({
            where: { formUrl },
            include: {
                fields: {
                    include: {
                        answers: {
                            include: {
                                response: {
                                    select: {
                                        id: true,
                                        submittedAt: true,
                                        user: { select: { id: true, username: true, email: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                contributors: {
                    select: {
                        userId: true,
                        permission: true,
                        user: { select: { id: true, username: true, email: true } },
                    },
                },
                creator: { select: { id: true, username: true, email: true } },
            },
            });


        if (!form) return res.status(404).json({ error: 'Form not found' });

        const isOwner = form.createdBy === user.id;
        const isContributor = form.contributors.some(c => c.userId === user.id);
        if (!isOwner && !isContributor) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        const responseWise = form.responses.map(response => ({
            responseId: response.id,
            submittedAt: response.submittedAt,
            submittedBy: response.user ? { id: response.user.id, username: response.user.username, email: response.user.email } : null,
            answers: response.answers.map(ans => ({
                fieldId: ans.fieldId,
                fieldLabel: ans.field.label,
                fieldType: ans.field.fieldType,
                answerValue: ans.answerValue,
                answerJson: ans.answerJson
            }))
        }));

        const questionWise = form.fields.map(field => ({
            id: field.id,
            label: field.label,
            fieldType: field.fieldType,
            answers: field.answers.map(ans => ({
                responseId: ans.response.id,
                submittedAt: ans.response.submittedAt,
                submittedBy: ans.response.user
                ? { id: ans.response.user.id, username: ans.response.user.username, email: ans.response.user.email }
                : null,
                answerValue: ans.answerValue,
                answerJson: ans.answerJson,
            })),
        }));

        res.status(200).json({
            id: form.id,
            title: form.title,
            formUrl: form.formUrl,
            description: form.description,
            isActive: form.isActive,
            isTemplate: form.isTemplate,
            isEditable: form.isEditable,
            fields: form.fields,
            contributors: form.contributors,
            creator: form.creator,
            responsesCount: form.responses.length,
            responseWise,
            questionWise
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch form: ' + error });
    }
};

export const getFormById = async (req, res) => {
    try {
        const { formId } = req.params;
        const user = ensureAuth(req);

        console.log('=== GET FORM BY ID FOR EDITING ===');
        console.log('Requested formId:', formId);
        console.log('User:', user.id);

        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                fields: {
                    orderBy: { position: 'asc' },
                },
                contributors: {
                    select: {
                        userId: true,
                        permission: true,
                        user: { select: { id: true, username: true, email: true } },
                    },
                },
            },
        });

        if (!form) {
            console.log('Form not found');
            return res.status(404).json({ 
                success: false,
                error: 'Form not found' 
            });
        }

        const isOwner = form.createdBy === user.id;
        const isContributor = form.contributors.some(c => c.userId === user.id);
        if (!isOwner && !isContributor) {
            console.log('Permission denied - not owner or contributor');
            return res.status(403).json({ 
                success: false,
                error: 'Permission denied' 
            });
        }

        console.log('Form found and user has permission');
        
        res.status(200).json({
            success: true,
            id: form.id,
            title: form.title,
            formUrl: form.formUrl,
            description: form.description,
            isActive: form.isActive,
            isEditable: form.isEditable,
            fields: form.fields,
            contributors: form.contributors,
            createdAt: form.createdAt,
            updatedAt: form.updatedAt
        });

    } catch (error) {
        console.error('Error fetching form by ID:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch form',
            message: error.message 
        });
    }
};

export const getFormForDisplay = async (req, res) => {
    try {
        const { formUrl } = req.params;
        console.log('=== GET FORM FOR DISPLAY ===');
        console.log('Requested formUrl:', formUrl);

        const form = await prisma.form.findUnique({
            where: { formUrl },
            include: {
                fields: {
                    orderBy: { position: 'asc' },
                    select: {
                        id: true,
                        label: true,
                        fieldType: true,
                        isRequired: true,
                        placeholder: true,
                        helpText: true,
                        options: true,
                        validation: true,
                        conditions: true,
                    }
                },
                creator: {
                    select: { id: true, username: true, email: true }
                }
            }
        });

        console.log('Found form:', form ? `ID: ${form.id}, Active: ${form.isActive}` : 'null');
        
        if (!form) {
            console.log('Form not found in database');
            return res.status(404).json({ 
                success: false,
                error: "Form not found" 
            });
        }
        
        if (!form.isActive) {
            console.log('Form found but inactive');
            return res.status(404).json({ 
                success: false,
                error: "Form not active" 
            });
        }

        const formattedFields = form.fields.map(field => ({
            id: field.id,
            label: field.label,
            fieldType: field.fieldType, // Keep as fieldType, not type
            isRequired: field.isRequired,
            placeholder: field.placeholder || '',
            helpText: field.helpText || '',
            options: field.options ? (typeof field.options === 'string' ? JSON.parse(field.options) : field.options) : [],
            validation: field.validation ? (typeof field.validation === 'string' ? JSON.parse(field.validation) : field.validation) : {},
            conditions: field.conditions ? (typeof field.conditions === 'string' ? JSON.parse(field.conditions) : field.conditions) : {}
        }));

        console.log('Returning form data successfully');
        res.status(200).json({
            success: true,
            form: {
                id: form.id,
                title: form.title,
                description: form.description,
                isEditable: form.isEditable,
                isActive: form.isActive,
                createdAt: form.createdAt,
                creator: form.creator,
                fields: formattedFields
            }
        });

    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch form',
            message: error.message 
        });
    }
};

export const createFormResponse = async (req, res) => {
    try {
        const { formUrl } = req.params;
        const { answers, submittedBy } = req.body;

        console.log('=== CREATE FORM RESPONSE ===');
        console.log('Form URL:', formUrl);
        console.log('Submitted by:', submittedBy || 'Anonymous');
        console.log('Answers count:', answers ? answers.length : 0);
        
        // Debug: Log all received field IDs
        if (answers) {
            console.log('Received answers with field IDs:', answers.map(a => ({ 
                fieldId: a.fieldId, 
                type: typeof a.fieldId,
                value: a.answerValue 
            })));
        }

        const form = await prisma.form.findUnique({
            where: { formUrl },
            include: { fields: true },
        });

        if (!form) {
            console.log('Form not found for URL:', formUrl);
            return res.status(404).json({ 
                success: false,
                error: "Form not found" 
            });
        }

        if (!form.isActive) {
            return res.status(400).json({ 
                success: false,
                error: "Form is not active" 
            });
        }

        // Debug: Log form field IDs
        console.log('Form field IDs:', form.fields.map(f => ({ id: f.id, type: typeof f.id })));

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "Answers array is required" 
            });
        }

        // Generate anonymous ID for anonymous submissions that might need editing later
        const anonymousId = crypto.randomBytes(6).toString('hex').toUpperCase();

        const response = await prisma.formResponse.create({
            data: {
                formId: form.id,
                submittedBy: submittedBy || null,
                anonymousId: !submittedBy ? anonymousId : null, // Only set for anonymous submissions
            },
        });

        console.log('Created form response:', response.id);

        const fieldAnswersData = [];

        for (const ans of answers) {
            // Convert fieldId to number for comparison since database IDs are integers
            const fieldId = parseInt(ans.fieldId, 10);
            const field = form.fields.find(f => f.id === fieldId);
            if (!field) {
                return res.status(400).json({ error: `Invalid fieldId: ${ans.fieldId}` });
            }

            const allowedValues = Array.isArray(field.options)
            ? field.options
            : field.options?.values || [];

            if (["TEXT"].includes(field.fieldType)) {
                if (!ans.answerValue || typeof ans.answerValue !== "string") {
                    return res.status(400).json({ error: `Text answer required for "${field.label}".` });
                }
            } 
            else if (["SINGLE_CHOICE", "DROPDOWN"].includes(field.fieldType)) {
                if (!allowedValues.includes(String(ans.answerValue))) {
                    return res.status(400).json({ error: `Invalid option for "${field.label}".` });
                }
            } 
            else if (["MULTIPLE_CHOICE", "CHECKBOXES"].includes(field.fieldType)) {
                const allowMultiple = field.allowMultiple ?? true;
                const selections = Array.isArray(ans.answerJson)
                ? ans.answerJson
                : ans.answerValue
                ? [ans.answerValue]
                : [];

                if (selections.length === 0) {
                    return res.status(400).json({ error: `At least one option required for "${field.label}".` });
                }

                if (!allowMultiple && selections.length > 1) {
                    return res.status(400).json({ error: `"${field.label}" allows only one selection.` });
                }

                for (const val of selections) {
                    if (!allowedValues.includes(String(val))) {
                        return res.status(400).json({ error: `Invalid option "${val}" in "${field.label}".` });
                    }
                }

                fieldAnswersData.push({
                    responseId: response.id,
                    fieldId: field.id,
                    answerJson: selections,
                });
                continue;
            }

            fieldAnswersData.push({
                responseId: response.id,
                fieldId: field.id,
                answerValue: ans.answerValue ?? null,
            });
        }

        
        await prisma.fieldAnswer.createMany({
            data: fieldAnswersData,
        });

        console.log('Form response submitted successfully');

        // Prepare response data
        const responseData = {
            success: true,
            message: "Form response submitted successfully",
            responseId: response.id,
        };

        // Include anonymous ID and edit info for editable forms
        if (form.isEditable && !submittedBy) {
            responseData.anonymousId = anonymousId;
            responseData.editUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/form/${formUrl}/edit/${anonymousId}`;
            responseData.canEdit = true;
        }

        res.status(201).json(responseData);
        
    } catch (error) {
        console.error('Error submitting form response:', error);
        res.status(500).json({ 
            success: false,
            error: "Failed to submit form response",
            message: error.message 
        });
    }
};

export const updateFormResponse = async (req, res) => {
    try {
        const { formUrl } = req.params;
        const { answers, submittedBy, anonymousId } = req.body;

        const form = await prisma.form.findUnique({
            where: { formUrl },
            include: { fields: true },
        });

        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }

        if (!form.isEditable) {
            return res.status(200).json({ message: "This form cannot be edited." });
        }

        if(!submittedBy && !anonymousId){
            return res.status(403).json({ error: "Missing credentials to edit response." });
        }

        const response = await prisma.formResponse.findUnique({
            where: { 
                OR: [
                    { submittedBy: submittedBy },
                    { anonymousId: anonymousId }
                ]
            },
            include: { answers: true },
        });

        if (!response) {
            return res.status(404).json({ error: "Response not found" });
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ error: "Answers array is required." });
        }

        const fieldAnswersData = [];

        for (const ans of answers) {
        // Convert fieldId to number for comparison since database IDs are integers
        const fieldId = parseInt(ans.fieldId, 10);
        const field = form.fields.find(f => f.id === fieldId);
        if (!field) {
            return res.status(400).json({ error: `Invalid fieldId: ${ans.fieldId}` });
        }

        const allowedValues = Array.isArray(field.options)
            ? field.options
            : field.options?.values || [];

        if (["TEXT"].includes(field.fieldType)) {
            if (!ans.answerValue || typeof ans.answerValue !== "string") {
                return res.status(400).json({ error: `Text answer required for "${field.label}".` });
            }
        } 
        else if (["SINGLE_CHOICE", "DROPDOWN"].includes(field.fieldType)) {
            if (!allowedValues.includes(String(ans.answerValue))) {
                return res.status(400).json({ error: `Invalid option for "${field.label}".` });
            }
        } 
        else if (["MULTIPLE_CHOICE", "CHECKBOXES"].includes(field.fieldType)) {
            const allowMultiple = field.allowMultiple ?? true;
            const selections = Array.isArray(ans.answerJson)
            ? ans.answerJson
            : ans.answerValue
            ? [ans.answerValue]
            : [];

            if (selections.length === 0) {
                return res.status(400).json({ error: `At least one option required for "${field.label}".` });
            }

            if (!allowMultiple && selections.length > 1) {
                return res.status(400).json({ error: `"${field.label}" allows only one selection.` });
            }

            for (const val of selections) {
                if (!allowedValues.includes(String(val))) {
                    return res.status(400).json({ error: `Invalid option "${val}" in "${field.label}".` });
                }
            }

            fieldAnswersData.push({
                responseId: response.id,
                fieldId: field.id,
                answerJson: selections,
            });
            continue;
        }

        fieldAnswersData.push({
            responseId: response.id,
            fieldId: field.id,
            answerValue: ans.answerValue ?? null,
        });
        }

        await prisma.$transaction(async tx => {
            await tx.fieldAnswer.deleteMany({
                where: { responseId: response.id },
            });

            await tx.fieldAnswer.createMany({
                data: fieldAnswersData,
            });

            await tx.formResponse.update({
                where: { id: response.id },
                data: { submittedAt: new Date() },
            });
        });

        res.status(200).json({
            responseId: response.id,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update form response: " + error });
    }
};

export const getFormResponses = async (req, res) => {
    try {
        const { formUrl } = req.params;
        const { submittedBy, anonymousId } = req.body;

        console.log('=== GET FORM RESPONSES ===');
        console.log('Form URL:', formUrl);
        console.log('Anonymous ID:', anonymousId);
        console.log('Submitted By:', submittedBy);

        const form = await prisma.form.findUnique({
            where: { formUrl },
            include: {
                fields: true,
                responses: {
                    include: {
                        answers: {
                            include: { field: { select: { id: true, label: true, fieldType: true } } }
                        },
                        user: { select: { id: true, username: true, email: true } }
                    }
                },
                creator: { select: { id: true } },
            }
        });

        if (!form) return res.status(404).json({ error: "Form not found" });
        if (!form.isEditable) {
            return res.status(200).json({ message: "This form's responses are not editable." });
        }
        
        console.log('Form is editable, filtering responses...');
        console.log('Total responses found:', form.responses.length);
        
        const allowedResponses = form.responses.filter(r => r.anonymousId === anonymousId || r.submittedBy === submittedBy);
        
        console.log('Filtered responses:', allowedResponses.length);
        console.log('Looking for anonymousId:', anonymousId);
        console.log('Available anonymousIds:', form.responses.map(r => r.anonymousId));

        if (!allowedResponses.length) {
            return res.status(403).json({ error: "No editable responses found for this user" });
        }

        const responseWise = allowedResponses.map(response => ({
            responseId: response.id,
            submittedAt: response.submittedAt,
            submittedBy: response.user ? { id: response.user.id, username: response.user.username, email: response.user.email } : null,
            answers: response.answers.map(ans => ({
                fieldId: ans.fieldId,
                fieldLabel: ans.field.label,
                fieldType: ans.field.fieldType,
                answerValue: ans.answerValue ?? null,
                answerJson: ans.answerJson ?? null
            }))
        }));

        res.status(200).json({ formId: form.id, title: form.title, responseWise });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch form responses: " + error });
    }
};

// Get all responses for a form by form ID (for form creators/contributors)
export const getFormResponsesById = async (req, res) => {
    try {
        const { formId } = req.params;
        
        console.log('=== GET FORM RESPONSES BY ID ===');
        console.log('Form ID:', formId);
        console.log('Requested by user:', req.user?.id);

        // Get the form and check permissions
        const form = await prisma.form.findUnique({
            where: { id: formId },
            include: {
                fields: {
                    orderBy: { position: 'asc' }
                },
                contributors: true
            }
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        // Check if user is the creator or a contributor
        const isCreator = form.createdBy === req.user.id;
        const isContributor = form.contributors.some(c => c.userId === req.user.id);
        
        if (!isCreator && !isContributor) {
            return res.status(403).json({ error: 'Not authorized to view responses' });
        }

        // Get all responses for this form
        const responses = await prisma.formResponse.findMany({
            where: { formId },
            include: {
                answers: {
                    include: {
                        field: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
            orderBy: { submittedAt: 'desc' }
        });

        console.log(`Found ${responses.length} responses for form ${formId}`);

        res.status(200).json({
            success: true,
            form: {
                id: form.id,
                title: form.title,
                description: form.description,
                fields: form.fields
            },
            responses: responses.map(response => ({
                id: response.id,
                submittedAt: response.submittedAt,
                submittedBy: response.submittedBy ? {
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email
                } : null,
                anonymousId: response.anonymousId,
                answers: response.answers.map(answer => ({
                    fieldId: answer.fieldId,
                    fieldLabel: answer.field.label,
                    fieldType: answer.field.fieldType,
                    answerValue: answer.answerValue,
                    answerJson: answer.answerJson
                }))
            }))
        });

    } catch (error) {
        console.error('Error fetching form responses:', error);
        res.status(500).json({ error: 'Failed to fetch form responses' });
    }
};
