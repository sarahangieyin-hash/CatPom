export function generateUnionId() {

    return `union_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

}

export function unique(array) {

    return [...new Set(array)];

}

export function removeFromArray(array, value) {

    return array.filter(item => item !== value);

}

export function arrayEquals(a, b) {

    if (a.length !== b.length) {

        return false;

    }

    return a.every(value => b.includes(value));

}

export function chunk(array, size) {

    const result = [];

    for (let i = 0; i < array.length; i += size) {

        result.push(array.slice(i, i + size));

    }

    return result;

}
