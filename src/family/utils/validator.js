import { MAX_CHILDREN } from '../constants.js';

export function canAdopt(person) {

    return person.children.length < MAX_CHILDREN;

}

export function alreadyRelated(person, userId, list) {

    return person[list].includes(userId);

}

export function canMarry(person, userId) {

    return !person.marriages.includes(userId);

}

export function canBecomeLovers(person, userId) {

    return !person.lovers.includes(userId);

}

export function canBecomeEnemies(person, userId) {

    return !person.enemies.includes(userId);

}

export function canAddSibling(person, userId) {

    return !person.siblings.includes(userId);

}

export function canAddParent(person) {

    return person.parents.length < 2;

}
