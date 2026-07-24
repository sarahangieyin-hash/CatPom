export const ErrorCodes = {
    UNKNOWN: "UNKNOWN",

    INTERACTION_INVALID: "INTERACTION_INVALID",
    INTERACTION_EXPIRED: "INTERACTION_EXPIRED",
    INTERACTION_RESPONSE_FAILED: "INTERACTION_RESPONSE_FAILED",

    TASK_ERROR: "TASK_ERROR"
};


const errorMetadata = {

    UNKNOWN: {
        severity: "error",
        retryable: false,
        remediation: "Check bot logs for more information."
    },

    INTERACTION_INVALID: {
        severity: "warning",
        retryable: false,
        remediation: "The interaction was invalid or missing."
    },

    INTERACTION_EXPIRED: {
        severity: "warning",
        retryable: false,
        remediation: "The interaction expired before the bot could respond."
    },

    INTERACTION_RESPONSE_FAILED: {
        severity: "error",
        retryable: true,
        remediation: "Try the command again."
    },

    TASK_ERROR: {
        severity: "error",
        retryable: true,
        remediation: "Check the background task logs."
    }
};


export function getErrorMetadata(code) {

    return (
        errorMetadata[code] ||
        errorMetadata[ErrorCodes.UNKNOWN]
    );

}


export function getDefaultErrorCodeByType(type) {

    switch (type) {

        case "database":
            return "DATABASE_ERROR";

        case "permission":
            return "PERMISSION_ERROR";

        case "validation":
            return "VALIDATION_ERROR";

        case "network":
            return "NETWORK_ERROR";

        default:
            return ErrorCodes.UNKNOWN;
    }

}


export function resolveErrorCode({ error, errorType } = {}) {

    if (error?.context?.errorCode) {
        return error.context.errorCode;
    }


    return getDefaultErrorCodeByType(errorType);

}
