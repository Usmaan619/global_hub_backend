
const { constants } = require("../constants");

exports.errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode);

    // Log the error stack trace for development
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.json({
        title: getErrorTitle(statusCode),
        message: err.message || "An unexpected error occurred.",
        stackTrace: isDevelopment ? err.stack : {}
    });
};

// Helper function to map status codes to titles
function getErrorTitle(statusCode) {
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            return "Validation Error";
        case constants.NOT_FOUND:
            return "Not Found";
        case constants.UNAUTHORIZED:
            return "Unauthorized";
        case constants.FORBIDDEN:
            return "Forbidden";
        case constants.SERVER_ERROR:
            return "Server Error";
        default:
            return "Error";
    }
}
