import { generateUnionId } from '../utils/helpers.js';

export class MarriageManager {

    constructor(graph) {

        this.graph = graph;

    }

    createUnion(memberIds) {

        const unionId = generateUnionId();

        this.graph.createUnion(
            unionId,
            memberIds
        );

        for (const memberId of memberIds) {

            const person =
                this.graph.addPerson(memberId);

            person.unionId = unionId;

        }

        return this.graph.getUnion(unionId);

    }

    addMember(unionId, userId) {

        const union =
            this.graph.getUnion(unionId);

        if (!union) {

            return null;

        }

        if (!union.members.includes(userId)) {

            union.members.push(userId);

        }

        const person =
            this.graph.addPerson(userId);

        person.unionId = unionId;

        return union;

    }

    removeMember(unionId, userId) {

        const union =
            this.graph.getUnion(unionId);

        if (!union) {

            return null;

        }

        union.members =
            union.members.filter(
                member => member !== userId
            );

        const person =
            this.graph.getPerson(userId);

        if (person) {

            person.unionId = null;

        }

        return union;

    }

}
