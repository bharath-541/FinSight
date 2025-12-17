/**
 * Round a number to 2 decimal places
 * Used for monetary values in API responses
 * 
 * @param {number} value - The value to round
 * @returns {number} - Rounded value
 */
const round2 = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return 0;
    }
    return Math.round(value * 100) / 100;
};

module.exports = {
    round2
};
