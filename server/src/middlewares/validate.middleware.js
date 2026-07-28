import ApiError from "../utils/apiError.js";

export const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details
                .map((detail) => detail.message)
                .join(", ");

            return next(new ApiError(400, message));
        }

        req[property] = value;

        next();
    };
};