export function wrapServiceBoundary(fn, name = 'service') {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`[${name}]`, error);
            throw error;
        }
    };
}
