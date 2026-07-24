const storage = new Map();

export function get(key) {
    return storage.get(key);
}

export function set(key, value) {
    storage.set(key, value);
}

export function deleteKey(key) {
    storage.delete(key);
}

export function has(key) {
    return storage.has(key);
}

export function clear() {
    storage.clear();
}

export default {
    get,
    set,
    deleteKey,
    has,
    clear
};
