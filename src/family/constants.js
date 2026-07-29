export const MAX_CHILDREN = 5;

export const REQUEST_TIMEOUT = 5 * 60 * 1000;

export const RelationshipType = Object.freeze({

    MARRIAGE: 'marriage',

    LOVER: 'lover',

    PARENT: 'parent',

    CHILD: 'child',

    ADOPTED_CHILD: 'adopted_child',

    SIBLING: 'sibling',

    ENEMY: 'enemy',

    FRIEND: 'friend'

});

export const RequestType = Object.freeze({

    MARRIAGE: 'marriage',

    ADOPTION: 'adoption',

    DIVORCE: 'divorce',

    ADD_MEMBER: 'add_member'

});

export const FamilyRole = Object.freeze({

    OWNER: 'owner',

    MEMBER: 'member'

});
