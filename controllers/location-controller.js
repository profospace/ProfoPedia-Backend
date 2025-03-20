const propertyUtils = require('../utils/propertyUtils');

/**
 * Get all tehsils
 */
exports.getTehsils = (req, res) => {
    try {
        const { language = 'english' } = req.query;

        // Get all tehsils with appropriate language
        const tehsils = propertyUtils.getAllTehsils(language);

        res.status(200).json({
            count: tehsils.length,
            tehsils: tehsils
        });

    } catch (error) {
        console.error('Error fetching tehsils:', error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
};

/**
 * Get villages by tehsil code
 */
exports.getVillagesByTehsil = (req, res) => {
    try {
        const { tehsilCode } = req.params;
        const { language = 'english' } = req.query;

        if (!tehsilCode) {
            return res.status(400).json({ message: "Tehsil code is required" });
        }

        // Get villages for specified tehsil with appropriate language
        const villages = propertyUtils.getVillagesByTehsil(tehsilCode, language);

        res.status(200).json({
            tehsilCode,
            tehsilName: propertyUtils.getTehsilName(tehsilCode, language),
            count: villages.length,
            villages: villages
        });

    } catch (error) {
        console.error('Error fetching villages:', error);
        res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
};