// Validation middleware functions

/**
 * Validates property data request
 */
exports.validatePropertyDataRequest = (req, res, next) => {
    const { districtCode, sroCode, gaonCode1 } = req.body;

    if (!districtCode) {
        return res.status(400).json({ message: "District code is required" });
    }

    if (!sroCode) {
        return res.status(400).json({ message: "SRO/Tehsil code is required" });
    }

    if (!gaonCode1) {
        return res.status(400).json({ message: "Village/Mohalla code is required" });
    }

    next();
};

/**
 * Validates property records request
 */
exports.validatePropertyRecordsRequest = (req, res, next) => {
    const { skip, limit } = req.query;

    // Validate skip parameter if provided
    if (skip && (!Number.isInteger(Number(skip)) || Number(skip) < 0)) {
        return res.status(400).json({ message: "Skip parameter must be a non-negative integer" });
    }

    // Validate limit parameter if provided
    if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 500)) {
        return res.status(400).json({ message: "Limit parameter must be an integer between 1 and 500" });
    }

    next();
};