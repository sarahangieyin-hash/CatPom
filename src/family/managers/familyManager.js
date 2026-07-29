export class FamilyManager {

    constructor(graph) {

        this.graph = graph;

    }

    getPerson(userId) {

        return this.graph.getPerson(userId);

    }

    getUnion(unionId) {

        return this.graph.getUnion(unionId);

    }

    getFamilyFromPerson(userId) {

        const person = this.graph.getPerson(userId);

        if (!person) {

            return null;

        }

        if (!person.unionId) {

            return {

                person,

                union: null,

                members: [userId],
                children: person.children

            };

        }

        const union = this.graph.getUnion(
            person.unionId
        );

        return {

            person,

            union,

            members: union?.members ?? [],
            children: union?.children ?? []

        };

    }

    isInUnion(userId) {

        const person = this.graph.getPerson(userId);

        if (!person) {

            return false;

        }

        return person.unionId !== null;

    }

    getMembers(userId) {

        const family = this.getFamilyFromPerson(userId);

        return family.members;

    }

    getChildren(userId) {

        const family = this.getFamilyFromPerson(userId);

        return family.children;

    }

}
