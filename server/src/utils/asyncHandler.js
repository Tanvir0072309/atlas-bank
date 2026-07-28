/**
 * Wraps async route handlers and forwards errors to Express error middleware.
 *
 * @param {Function} requestHandler
 * @returns {Function}
 */
const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};

export default asyncHandler;