export function normalizeEconomyData(data = {}) {
    return {
        balance: Number(data.balance || 0),
        bank: Number(data.bank || 0),
        ...data
    };
}
