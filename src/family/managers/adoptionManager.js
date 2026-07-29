import { MAX_CHILDREN } from '../constants.js';

export class AdoptionManager {

    constructor(graph) {

        this.graph = graph;

    }

    adoptChild(parentId, childId) {

        const parent = this.graph.addPerson(parentId);

        if (parent.children.length >= MAX_CHILDREN) {

            throw new Error('Máximo de hijos alcanzado.');

        }

        const child = this.graph.addPerson(childId);

        if (!parent.children.includes(childId)) {

            parent.children.push(childId);

        }

        if (!child.parents.includes(parentId)) {

            child.parents.push(parentId);

        }

        const union = this.graph.getUnion(parent.unionId);

        if (union && !union.children.includes(childId)) {

            union.children.push(childId);

        }

        return child;

    }

    removeChild(parentId, childId) {

        const parent = this.graph.getPerson(parentId);

        const child = this.graph.getPerson(childId);

        if (!parent || !child) {

            return;

        }

        parent.children = parent.children.filter(
            id => id !== childId
        );

        child.parents = child.parents.filter(
            id => id !== parentId
        );

        const union = this.graph.getUnion(parent.unionId);

        if (union) {

            const stillExists = union.members.some(memberId => {

                const member = this.graph.getPerson(memberId);

                return member?.children.includes(childId);

            });

            if (!stillExists) {

                union.children = union.children.filter(
                    id => id !== childId
                );

            }

        }

    }

}
