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
export class MemoryStorage {
    constructor() {
        this.storage = new Map();
    }

    get(key) {
        return this.storage.get(key);
    }

    set(key, value) {
        this.storage.set(key, value);
    }

    deleteKey(key) {
        this.storage.delete(key);
    }

    has(key) {
        return this.storage.has(key);
    }

    clear() {
        this.storage.clear();
    }
}
