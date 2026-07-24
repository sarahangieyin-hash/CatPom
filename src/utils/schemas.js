export function normalizeEconomyData(data = {}) {
    return {
        balance: Number(data.balance || 0),
        bank: Number(data.bank || 0),
        ...data
    };
}

export function validateGuildConfigOrThrow(config) {
    if (!config || typeof config !== 'object') {
        throw new Error('Invalid guild config');
    }

    return config;
}

console.log("schemas loaded correctly");
