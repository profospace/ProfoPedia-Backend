// const express = require('express');
// const router = express.Router();
// const Deed = require('../models/deedSchema'); // Adjust the path as needed

// /**
//  * Utility functions for handling transaction value duplication
//  */

// /**
//  * Checks if a transaction value appears to be duplicated
//  * @param {number} value - The transaction value to check
//  * @returns {boolean} - True if the value appears to be duplicated
//  */
// function isTransactionValueDuplicated(value) {
//     if (typeof value !== 'number') return false;

//     const strValue = value.toString();
//     const halfLength = Math.floor(strValue.length / 2);

//     // Only check if the length is even
//     if (strValue.length % 2 === 0) {
//         const firstHalf = strValue.substring(0, halfLength);
//         const secondHalf = strValue.substring(halfLength);

//         // Return true if the two halves are identical
//         return firstHalf === secondHalf;
//     }

//     return false;
// }

// /**
//  * Fixes a duplicated transaction value
//  * For example: 7599200075992000 -> 75992000
//  * @param {number} value - The transaction value to fix
//  * @returns {number} - The fixed transaction value
//  */
// function fixDuplicatedTransactionValue(value) {
//     if (!isTransactionValueDuplicated(value)) return value;

//     const strValue = value.toString();
//     const halfLength = Math.floor(strValue.length / 2);
//     const firstHalf = strValue.substring(0, halfLength);

//     return parseInt(firstHalf, 10);
// }

// /**
//  * Route Endpoints
//  */

// /**
//  * GET /api/deeds/check-transaction-values
//  * Checks for potential duplicated transaction values without fixing them
//  */
// router.get('/check-transaction-values', async (req, res) => {
//     try {
//         const result = {
//             total: 0,
//             potentialDuplicates: 0,
//             documents: []
//         };

//         // Get all deed documents
//         const deeds = await Deed.find({});
//         result.total = deeds.length;

//         // Process each document
//         for (const deed of deeds) {
//             // Only check the transactionValue field
//             if (deed.transactionValue) {
//                 const originalValue = deed.transactionValue;
//                 const fixedValue = fixDuplicatedTransactionValue(originalValue);

//                 // If a duplication was detected
//                 if (fixedValue !== originalValue) {
//                     result.potentialDuplicates++;
//                     result.documents.push({
//                         id: deed._id,
//                         detailUniqueId: deed.detailUniqueId,
//                         currentValue: originalValue,
//                         suggestedValue: fixedValue
//                     });
//                 }
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Found ${result.potentialDuplicates} documents with potential duplicated transaction values`,
//             result
//         });
//     } catch (error) {
//         console.error('Error checking transaction values:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error checking transaction values',
//             error: error.message
//         });
//     }
// });

// /**
//  * POST /api/deeds/fix-transaction-values
//  * Fixes all duplicated transaction values in the database
//  */
// router.post('/fix-transaction-values', async (req, res) => {
//     try {
//         const result = {
//             total: 0,
//             fixed: 0,
//             errors: []
//         };

//         // Get all deed documents
//         const deeds = await Deed.find({});
//         result.total = deeds.length;

//         // Process each document
//         for (const deed of deeds) {
//             try {
//                 // Only check and fix the transactionValue field
//                 if (deed.transactionValue) {
//                     const originalValue = deed.transactionValue;
//                     const fixedValue = fixDuplicatedTransactionValue(originalValue);

//                     // If a duplication was fixed, update the document
//                     if (fixedValue !== originalValue) {
//                         deed.transactionValue = fixedValue;
//                         await deed.save();
//                         result.fixed++;
//                     }
//                 }
//             } catch (docError) {
//                 result.errors.push({
//                     id: deed._id,
//                     error: docError.message
//                 });
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Fixed transaction values in ${result.fixed} out of ${result.total} documents`,
//             result
//         });
//     } catch (error) {
//         console.error('Error fixing transaction values:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fixing transaction values',
//             error: error.message
//         });
//     }
// });

// /**
//  * POST /api/deeds/fix-transaction-value/:id
//  * Fixes the transaction value for a specific document
//  */
// router.post('/fix-transaction-value/:id', async (req, res) => {
//     try {
//         const deed = await Deed.findById(req.params.id);

//         if (!deed) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Document not found'
//             });
//         }

//         if (!deed.transactionValue) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Document does not have a transaction value'
//             });
//         }

//         const originalValue = deed.transactionValue;
//         const fixedValue = fixDuplicatedTransactionValue(originalValue);

//         if (fixedValue === originalValue) {
//             return res.status(200).json({
//                 success: true,
//                 message: 'Transaction value is not duplicated',
//                 value: originalValue
//             });
//         }

//         deed.transactionValue = fixedValue;
//         await deed.save();

//         res.status(200).json({
//             success: true,
//             message: 'Transaction value fixed successfully',
//             originalValue,
//             newValue: fixedValue
//         });
//     } catch (error) {
//         console.error('Error fixing transaction value:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fixing transaction value',
//             error: error.message
//         });
//     }
// });

// /**
//  * PATCH /api/deeds/fix-multiple-transaction-values
//  * Fixes transaction values for specific documents by IDs
//  */
// router.patch('/fix-multiple-transaction-values', async (req, res) => {
//     try {
//         const { ids } = req.body;

//         if (!ids || !Array.isArray(ids) || ids.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide an array of document IDs'
//             });
//         }

//         const result = {
//             total: ids.length,
//             fixed: 0,
//             skipped: 0,
//             errors: []
//         };

//         for (const id of ids) {
//             try {
//                 const deed = await Deed.findById(id);

//                 if (!deed) {
//                     result.errors.push({
//                         id,
//                         error: 'Document not found'
//                     });
//                     continue;
//                 }

//                 if (!deed.transactionValue) {
//                     result.skipped++;
//                     continue;
//                 }

//                 const originalValue = deed.transactionValue;
//                 const fixedValue = fixDuplicatedTransactionValue(originalValue);

//                 if (fixedValue !== originalValue) {
//                     deed.transactionValue = fixedValue;
//                     await deed.save();
//                     result.fixed++;
//                 } else {
//                     result.skipped++;
//                 }
//             } catch (error) {
//                 result.errors.push({
//                     id,
//                     error: error.message
//                 });
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: `Fixed ${result.fixed} out of ${result.total} documents`,
//             result
//         });
//     } catch (error) {
//         console.error('Error fixing transaction values:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fixing transaction values',
//             error: error.message
//         });
//     }
// });

// /**
//  * POST /api/deeds/add-transaction-validation
//  * Adds validation to the Deed schema to prevent duplicated transaction values
//  * This is an administrative route that modifies the schema
//  */
// router.post('/add-transaction-validation', (req, res) => {
//     try {
//         // Add validation to the schema
//         const transactionValuePath = Deed.schema.path('transactionValue');

//         // Check if validation already exists
//         const validations = transactionValuePath.validators || [];
//         const hasValidation = validations.some(v =>
//             v.message && v.message.includes('duplicated'));

//         if (hasValidation) {
//             return res.status(200).json({
//                 success: true,
//                 message: 'Validation already exists for transaction value'
//             });
//         }

//         // Add validation
//         transactionValuePath.validate({
//             validator: function (value) {
//                 return !isTransactionValueDuplicated(value);
//             },
//             message: 'Transaction value appears to be duplicated'
//         });

//         // Add pre-save hook to automatically fix duplicated values
//         if (!Deed.schema._hasPreSaveHook) {
//             Deed.schema.pre('save', function (next) {
//                 if (this.transactionValue) {
//                     this.transactionValue = fixDuplicatedTransactionValue(this.transactionValue);
//                 }
//                 next();
//             });
//             Deed.schema._hasPreSaveHook = true;
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Added validation for transaction value'
//         });
//     } catch (error) {
//         console.error('Error adding validation:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error adding validation',
//             error: error.message
//         });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const Deed = require('../models/deedSchema'); // Adjust the path as needed

/**
 * Utility functions for handling duplicated values
 */

/**
 * Fixes repeated values in a string
 * @param {string} value - The value to check and fix
 * @returns {string} - The fixed value
 */
function fixRepeatedValue(value) {
    if (!value || typeof value !== 'string') return value;

    // Check if the string has repeated content
    const halfLength = Math.floor(value.length / 2);
    const firstHalf = value.substring(0, halfLength);
    const secondHalf = value.substring(halfLength);

    // If the two halves are identical, return just one half
    if (firstHalf === secondHalf) {
        return firstHalf;
    }

    // Check if there's a pattern of repetition (e.g., "ABCABC")
    for (let i = 1; i <= halfLength; i++) {
        const part = value.substring(0, i);
        let isRepeated = true;

        for (let j = 0; j < value.length; j += i) {
            const segment = value.substring(j, j + i);
            if (segment !== part && segment.length === part.length) {
                isRepeated = false;
                break;
            }
        }

        if (isRepeated && value.length % i === 0) {
            return part;
        }
    }

    return value;
}

/**
 * Fixes a duplicated numeric value
 * @param {number} value - The value to check and fix
 * @returns {number} - The fixed value
 */
function fixRepeatedNumber(value) {
    if (typeof value !== 'number') return value;

    // Convert to string to check for patterns
    const strValue = value.toString();
    const halfLength = Math.floor(strValue.length / 2);

    if (strValue.length % 2 === 0) {
        const firstHalf = strValue.substring(0, halfLength);
        const secondHalf = strValue.substring(halfLength);

        // If the two halves are identical, return the numeric value of one half
        if (firstHalf === secondHalf) {
            return parseInt(firstHalf, 10);
        }
    }

    return value;
}

/**
 * Checks if a value is duplicated
 * @param {any} value - The value to check
 * @returns {boolean} - True if the value appears to be duplicated
 */
function isValueDuplicated(value) {
    if (typeof value === 'string') {
        const halfLength = Math.floor(value.length / 2);
        const firstHalf = value.substring(0, halfLength);
        const secondHalf = value.substring(halfLength);

        return firstHalf === secondHalf;
    } else if (typeof value === 'number') {
        const strValue = value.toString();
        const halfLength = Math.floor(strValue.length / 2);

        if (strValue.length % 2 === 0) {
            const firstHalf = strValue.substring(0, halfLength);
            const secondHalf = strValue.substring(halfLength);

            return firstHalf === secondHalf;
        }
    }

    return false;
}

/**
 * Fixes a value that might be duplicated
 * @param {any} value - The value to fix
 * @returns {any} - The fixed value
 */
function fixDuplicatedValue(value) {
    if (typeof value === 'string') {
        return fixRepeatedValue(value);
    } else if (typeof value === 'number') {
        return fixRepeatedNumber(value);
    }

    return value;
}

/**
 * Defines which fields to check and fix
 * Add or remove fields as needed
 */
const fieldsToFix = {
    string: [
        'deedType', 'year', 'documentNumber', 'volumeNumber',
        'district', 'subRegistrar', 'ward', 'locality',
        'khasraNumber', 'propertyDescription', 'unitType',
        'executionDate', 'registrationDate', 'regdate'
    ],
    number: [
        'marketValue', 'transactionValue', 'stampDuty', 'area'
    ],
    parties: ['firstParty', 'secondParty', 'witnesses']
};

/**
 * Route Endpoints
 */

/**
 * GET /api/deeds/check-duplicated-values
 * Checks for potential duplicated values without fixing them
 */
router.get('/check-duplicated-values', async (req, res) => {
    try {
        const result = {
            total: 0,
            potentialDuplicates: 0,
            fieldStats: {},
            documents: []
        };

        // Initialize field stats
        [...fieldsToFix.string, ...fieldsToFix.number].forEach(field => {
            result.fieldStats[field] = 0;
        });

        // Get all deed documents
        const deeds = await Deed.find({});
        result.total = deeds.length;

        // Process each document
        for (const deed of deeds) {
            let hasDuplicate = false;
            const docDuplicates = {
                id: deed._id,
                detailUniqueId: deed.detailUniqueId,
                fields: {}
            };

            // Check string fields
            fieldsToFix.string.forEach(field => {
                if (deed[field] && typeof deed[field] === 'string') {
                    const originalValue = deed[field];
                    const fixedValue = fixRepeatedValue(originalValue);

                    if (fixedValue !== originalValue) {
                        result.fieldStats[field]++;
                        hasDuplicate = true;
                        docDuplicates.fields[field] = {
                            current: originalValue,
                            suggested: fixedValue
                        };
                    }
                }
            });

            // Check numeric fields
            fieldsToFix.number.forEach(field => {
                if (deed[field] && typeof deed[field] === 'number') {
                    const originalValue = deed[field];
                    const fixedValue = fixRepeatedNumber(originalValue);

                    if (fixedValue !== originalValue) {
                        result.fieldStats[field]++;
                        hasDuplicate = true;
                        docDuplicates.fields[field] = {
                            current: originalValue,
                            suggested: fixedValue
                        };
                    }
                }
            });

            // Check for duplicate parties
            fieldsToFix.parties.forEach(partyField => {
                if (deed[partyField] && Array.isArray(deed[partyField])) {
                    const uniqueParties = new Map();

                    deed[partyField].forEach(party => {
                        // Create a unique key for each party
                        const partyKey = `${party.name}-${party.parentName}-${party.address}`;

                        // Check for duplicated values within party fields
                        let hasInternalDuplication = false;
                        if (party.name && typeof party.name === 'string') {
                            const fixedName = fixRepeatedValue(party.name);
                            if (fixedName !== party.name) {
                                hasInternalDuplication = true;
                            }
                        }

                        if (party.address && typeof party.address === 'string') {
                            const fixedAddress = fixRepeatedValue(party.address);
                            if (fixedAddress !== party.address) {
                                hasInternalDuplication = true;
                            }
                        }

                        // Add to map to track duplicates
                        if (!uniqueParties.has(partyKey)) {
                            uniqueParties.set(partyKey, 1);
                        } else {
                            uniqueParties.set(partyKey, uniqueParties.get(partyKey) + 1);
                        }

                        if (hasInternalDuplication) {
                            hasDuplicate = true;
                            if (!docDuplicates.fields[partyField]) {
                                docDuplicates.fields[partyField] = {
                                    hasDuplicatedValues: true
                                };
                            }
                        }
                    });

                    // Check if we have duplicate parties
                    const hasDuplicateParties = Array.from(uniqueParties.values()).some(count => count > 1);
                    if (hasDuplicateParties) {
                        hasDuplicate = true;
                        if (!docDuplicates.fields[partyField]) {
                            docDuplicates.fields[partyField] = {};
                        }
                        docDuplicates.fields[partyField].hasDuplicateEntries = true;
                        docDuplicates.fields[partyField].currentCount = deed[partyField].length;
                        docDuplicates.fields[partyField].uniqueCount = uniqueParties.size;
                    }
                }
            });

            if (hasDuplicate) {
                result.potentialDuplicates++;
                result.documents.push(docDuplicates);
            }
        }

        res.status(200).json({
            success: true,
            message: `Found ${result.potentialDuplicates} documents with potential duplicated values`,
            result
        });
    } catch (error) {
        console.error('Error checking duplicated values:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking duplicated values',
            error: error.message
        });
    }
});

/**
 * POST /api/deeds/fix-duplicated-values
 * Fixes all duplicated values in the database
 */
router.post('/fix-duplicated-values', async (req, res) => {
    try {
        const result = {
            total: 0,
            fixed: 0,
            fieldStats: {},
            errors: []
        };

        // Initialize field stats
        [...fieldsToFix.string, ...fieldsToFix.number, ...fieldsToFix.parties].forEach(field => {
            result.fieldStats[field] = 0;
        });

        // Get all deed documents
        const deeds = await Deed.find({});
        result.total = deeds.length;

        // Process each document
        for (const deed of deeds) {
            try {
                let updated = false;

                // Fix string fields
                fieldsToFix.string.forEach(field => {
                    if (deed[field] && typeof deed[field] === 'string') {
                        const originalValue = deed[field];
                        const fixedValue = fixRepeatedValue(originalValue);

                        if (fixedValue !== originalValue) {
                            deed[field] = fixedValue;
                            updated = true;
                            result.fieldStats[field] = (result.fieldStats[field] || 0) + 1;
                        }
                    }
                });

                // Fix numeric fields
                fieldsToFix.number.forEach(field => {
                    if (deed[field] && typeof deed[field] === 'number') {
                        const originalValue = deed[field];
                        const fixedValue = fixRepeatedNumber(originalValue);

                        if (fixedValue !== originalValue) {
                            deed[field] = fixedValue;
                            updated = true;
                            result.fieldStats[field] = (result.fieldStats[field] || 0) + 1;
                        }
                    }
                });

                // Fix party arrays
                fieldsToFix.parties.forEach(partyField => {
                    if (deed[partyField] && Array.isArray(deed[partyField])) {
                        let partyUpdated = false;

                        // First fix repeated values within each party
                        deed[partyField].forEach(party => {
                            if (party.name && typeof party.name === 'string') {
                                const fixedName = fixRepeatedValue(party.name);
                                if (fixedName !== party.name) {
                                    party.name = fixedName;
                                    partyUpdated = true;
                                }
                            }

                            if (party.parentName && typeof party.parentName === 'string') {
                                const fixedParentName = fixRepeatedValue(party.parentName);
                                if (fixedParentName !== party.parentName) {
                                    party.parentName = fixedParentName;
                                    partyUpdated = true;
                                }
                            }

                            if (party.address && typeof party.address === 'string') {
                                const fixedAddress = fixRepeatedValue(party.address);
                                if (fixedAddress !== party.address) {
                                    party.address = fixedAddress;
                                    partyUpdated = true;
                                }
                            }
                        });

                        // Then remove duplicate parties
                        const uniqueParties = [];
                        const seenKeys = new Set();

                        deed[partyField].forEach(party => {
                            const partyKey = `${party.name}-${party.parentName}-${party.address}`;

                            if (!seenKeys.has(partyKey)) {
                                seenKeys.add(partyKey);
                                uniqueParties.push(party);
                            } else {
                                partyUpdated = true;
                            }
                        });

                        if (uniqueParties.length !== deed[partyField].length) {
                            deed[partyField] = uniqueParties;
                            partyUpdated = true;
                            result.fieldStats[partyField] = (result.fieldStats[partyField] || 0) + 1;
                        }

                        if (partyUpdated) {
                            updated = true;
                        }
                    }
                });

                // Save the document if changes were made
                if (updated) {
                    await deed.save();
                    result.fixed++;
                }
            } catch (docError) {
                result.errors.push({
                    id: deed._id,
                    error: docError.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Fixed values in ${result.fixed} out of ${result.total} documents`,
            result
        });
    } catch (error) {
        console.error('Error fixing duplicated values:', error);
        res.status(500).json({
            success: false,
            message: 'Error fixing duplicated values',
            error: error.message
        });
    }
});

/**
 * POST /api/deeds/fix-document/:id
 * Fixes all duplicated values for a specific document
 */
router.post('/fix-document/:id', async (req, res) => {
    try {
        const deed = await Deed.findById(req.params.id);

        if (!deed) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        const changes = {
            updated: false,
            fields: {}
        };

        // Fix string fields
        fieldsToFix.string.forEach(field => {
            if (deed[field] && typeof deed[field] === 'string') {
                const originalValue = deed[field];
                const fixedValue = fixRepeatedValue(originalValue);

                if (fixedValue !== originalValue) {
                    changes.fields[field] = {
                        original: originalValue,
                        fixed: fixedValue
                    };
                    deed[field] = fixedValue;
                    changes.updated = true;
                }
            }
        });

        // Fix numeric fields
        fieldsToFix.number.forEach(field => {
            if (deed[field] && typeof deed[field] === 'number') {
                const originalValue = deed[field];
                const fixedValue = fixRepeatedNumber(originalValue);

                if (fixedValue !== originalValue) {
                    changes.fields[field] = {
                        original: originalValue,
                        fixed: fixedValue
                    };
                    deed[field] = fixedValue;
                    changes.updated = true;
                }
            }
        });

        // Fix party arrays
        fieldsToFix.parties.forEach(partyField => {
            if (deed[partyField] && Array.isArray(deed[partyField])) {
                let partyChanges = {
                    fieldValuesFixed: false,
                    duplicatesRemoved: false,
                    originalCount: deed[partyField].length
                };

                // Fix repeated values within each party
                deed[partyField].forEach(party => {
                    if (party.name && typeof party.name === 'string') {
                        const fixedName = fixRepeatedValue(party.name);
                        if (fixedName !== party.name) {
                            party.name = fixedName;
                            partyChanges.fieldValuesFixed = true;
                        }
                    }

                    if (party.parentName && typeof party.parentName === 'string') {
                        const fixedParentName = fixRepeatedValue(party.parentName);
                        if (fixedParentName !== party.parentName) {
                            party.parentName = fixedParentName;
                            partyChanges.fieldValuesFixed = true;
                        }
                    }

                    if (party.address && typeof party.address === 'string') {
                        const fixedAddress = fixRepeatedValue(party.address);
                        if (fixedAddress !== party.address) {
                            party.address = fixedAddress;
                            partyChanges.fieldValuesFixed = true;
                        }
                    }
                });

                // Remove duplicate parties
                const uniqueParties = [];
                const seenKeys = new Set();

                deed[partyField].forEach(party => {
                    const partyKey = `${party.name}-${party.parentName}-${party.address}`;

                    if (!seenKeys.has(partyKey)) {
                        seenKeys.add(partyKey);
                        uniqueParties.push(party);
                    }
                });

                if (uniqueParties.length !== deed[partyField].length) {
                    deed[partyField] = uniqueParties;
                    partyChanges.duplicatesRemoved = true;
                    partyChanges.newCount = uniqueParties.length;
                }

                if (partyChanges.fieldValuesFixed || partyChanges.duplicatesRemoved) {
                    changes.fields[partyField] = partyChanges;
                    changes.updated = true;
                }
            }
        });

        // Save the document if changes were made
        if (changes.updated) {
            await deed.save();
            res.status(200).json({
                success: true,
                message: 'Document fixed successfully',
                changes
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'No duplicated values found in document'
            });
        }
    } catch (error) {
        console.error('Error fixing document:', error);
        res.status(500).json({
            success: false,
            message: 'Error fixing document',
            error: error.message
        });
    }
});

/**
 * PATCH /api/deeds/fix-multiple-documents
 * Fixes duplicated values for specific documents by IDs
 */
router.patch('/fix-multiple-documents', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of document IDs'
            });
        }

        const result = {
            total: ids.length,
            fixed: 0,
            skipped: 0,
            errors: []
        };

        for (const id of ids) {
            try {
                const deed = await Deed.findById(id);

                if (!deed) {
                    result.errors.push({
                        id,
                        error: 'Document not found'
                    });
                    continue;
                }

                let updated = false;

                // Fix string fields
                fieldsToFix.string.forEach(field => {
                    if (deed[field] && typeof deed[field] === 'string') {
                        const originalValue = deed[field];
                        const fixedValue = fixRepeatedValue(originalValue);

                        if (fixedValue !== originalValue) {
                            deed[field] = fixedValue;
                            updated = true;
                        }
                    }
                });

                // Fix numeric fields
                fieldsToFix.number.forEach(field => {
                    if (deed[field] && typeof deed[field] === 'number') {
                        const originalValue = deed[field];
                        const fixedValue = fixRepeatedNumber(originalValue);

                        if (fixedValue !== originalValue) {
                            deed[field] = fixedValue;
                            updated = true;
                        }
                    }
                });

                // Fix party arrays
                fieldsToFix.parties.forEach(partyField => {
                    if (deed[partyField] && Array.isArray(deed[partyField])) {
                        let partyUpdated = false;

                        // Fix repeated values within each party
                        deed[partyField].forEach(party => {
                            if (party.name && typeof party.name === 'string') {
                                const fixedName = fixRepeatedValue(party.name);
                                if (fixedName !== party.name) {
                                    party.name = fixedName;
                                    partyUpdated = true;
                                }
                            }

                            if (party.parentName && typeof party.parentName === 'string') {
                                const fixedParentName = fixRepeatedValue(party.parentName);
                                if (fixedParentName !== party.parentName) {
                                    party.parentName = fixedParentName;
                                    partyUpdated = true;
                                }
                            }

                            if (party.address && typeof party.address === 'string') {
                                const fixedAddress = fixRepeatedValue(party.address);
                                if (fixedAddress !== party.address) {
                                    party.address = fixedAddress;
                                    partyUpdated = true;
                                }
                            }
                        });

                        // Remove duplicate parties
                        const uniqueParties = [];
                        const seenKeys = new Set();

                        deed[partyField].forEach(party => {
                            const partyKey = `${party.name}-${party.parentName}-${party.address}`;

                            if (!seenKeys.has(partyKey)) {
                                seenKeys.add(partyKey);
                                uniqueParties.push(party);
                            } else {
                                partyUpdated = true;
                            }
                        });

                        if (uniqueParties.length !== deed[partyField].length) {
                            deed[partyField] = uniqueParties;
                            partyUpdated = true;
                        }

                        if (partyUpdated) {
                            updated = true;
                        }
                    }
                });

                if (updated) {
                    await deed.save();
                    result.fixed++;
                } else {
                    result.skipped++;
                }
            } catch (error) {
                result.errors.push({
                    id,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Fixed ${result.fixed} out of ${result.total} documents`,
            result
        });
    } catch (error) {
        console.error('Error fixing documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fixing documents',
            error: error.message
        });
    }
});

/**
 * POST /api/deeds/add-duplication-prevention
 * Adds validation and pre-save hooks to prevent duplicated values
 */
router.post('/add-duplication-prevention', (req, res) => {
    try {
        // Add pre-save hook to automatically fix duplicated values
        if (!Deed.schema._hasDuplicationPreventionHook) {
            Deed.schema.pre('save', function (next) {
                // Fix string fields
                fieldsToFix.string.forEach(field => {
                    if (this[field] && typeof this[field] === 'string') {
                        this[field] = fixRepeatedValue(this[field]);
                    }
                });

                // Fix numeric fields
                fieldsToFix.number.forEach(field => {
                    if (this[field] && typeof this[field] === 'number') {
                        this[field] = fixRepeatedNumber(this[field]);
                    }
                });

                // Fix party arrays
                fieldsToFix.parties.forEach(partyField => {
                    if (this[partyField] && Array.isArray(this[partyField])) {
                        // Fix repeated values within each party
                        this[partyField].forEach(party => {
                            if (party.name && typeof party.name === 'string') {
                                party.name = fixRepeatedValue(party.name);
                            }

                            if (party.parentName && typeof party.parentName === 'string') {
                                party.parentName = fixRepeatedValue(party.parentName);
                            }

                            if (party.address && typeof party.address === 'string') {
                                party.address = fixRepeatedValue(party.address);
                            }
                        });

                        // Remove duplicate parties
                        const uniqueParties = [];
                        const seenKeys = new Set();

                        this[partyField].forEach(party => {
                            const partyKey = `${party.name}-${party.parentName}-${party.address}`;

                            if (!seenKeys.has(partyKey)) {
                                seenKeys.add(partyKey);
                                uniqueParties.push(party);
                            }
                        });

                        if (uniqueParties.length !== this[partyField].length) {
                            this[partyField] = uniqueParties;
                        }
                    }
                });

                next();
            });

            Deed.schema._hasDuplicationPreventionHook = true;
        }

        res.status(200).json({
            success: true,
            message: 'Added duplication prevention hooks to schema'
        });
    } catch (error) {
        console.error('Error adding duplication prevention:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding duplication prevention',
            error: error.message
        });
    }
});

module.exports = router;

