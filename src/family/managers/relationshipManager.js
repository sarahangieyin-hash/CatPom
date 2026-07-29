import { RelationshipType } from '../constants.js';

export class RelationshipManager {

    constructor(graph) {

        this.graph = graph;

    }

    addRelationship(type, from, to) {

        const personA = this.graph.addPerson(from);
        const personB = this.graph.addPerson(to);

        switch (type) {

            case RelationshipType.LOVER:

                if (!personA.lovers.includes(to)) {
                    personA.lovers.push(to);
                }

                if (!personB.lovers.includes(from)) {
                    personB.lovers.push(from);
                }

                break;

            case RelationshipType.ENEMY:

                if (!personA.enemies.includes(to)) {
                    personA.enemies.push(to);
                }

                if (!personB.enemies.includes(from)) {
                    personB.enemies.push(from);
                }

                break;

            case RelationshipType.FRIEND:

                if (!personA.friends.includes(to)) {
                    personA.friends.push(to);
                }

                if (!personB.friends.includes(from)) {
                    personB.friends.push(from);
                }

                break;

            case RelationshipType.SIBLING:

                if (!personA.siblings.includes(to)) {
                    personA.siblings.push(to);
                }

                if (!personB.siblings.includes(from)) {
                    personB.siblings.push(from);
                }

                break;

            default:
                break;

        }

    }

}
