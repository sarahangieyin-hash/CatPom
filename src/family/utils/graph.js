export class FamilyGraph {

    constructor() {

        this.people = new Map();
        this.relationships = [];

    }

    addPerson(userId) {

        if (!this.people.has(userId)) {

            this.people.set(userId, {
                id: userId,
                marriages: [],
                lovers: [],
                parents: [],
                children: [],
                siblings: [],
                enemies: [],
                friends: []
            });

        }

        return this.people.get(userId);

    }

    getPerson(userId) {

        return this.people.get(userId);

    }

    addRelationship(type, from, to) {

        this.addPerson(from);
        this.addPerson(to);

        this.relationships.push({
            type,
            from,
            to
        });

    }

    getRelationships() {

        return this.relationships;

    }

}
