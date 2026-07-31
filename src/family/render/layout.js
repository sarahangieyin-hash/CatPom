export async function calculateLayout(guild, family) {
    const members = Array.isArray(family.members) ? family.members : [];
    const children = Array.isArray(family.children) ? family.children : [];
    const parents = Array.isArray(family.parents) ? family.parents : [];
    const siblings = Array.isArray(family.siblings) ? family.siblings : [];
    const lovers = Array.isArray(family.lovers) ? family.lovers : [];

    const nodes = [];

    const memberSpacing = Math.max(
        180,
        Math.min(320, 180 + members.length * 35)
    );

    const childSpacing = Math.max(
        160,
        Math.min(280, 160 + children.length * 25)
    );

    const parentSpacing = Math.max(
        180,
        Math.min(300, 180 + parents.length * 25)
    );

    const centerY = 0; // Se usará como origen relativo para el centrado final

    /*
        MIEMBROS PRINCIPALES 💍
    */
    members.forEach((id, index) => {
        nodes.push({
            id,
            type: 'member',
            x: (index - (members.length - 1) / 2) * memberSpacing,
            y: centerY
        });
    });

    /*
        UNIONES 💍
    */
    if (members.length >= 2) {
        for (let i = 0; i < members.length - 1; i++) {
            const left = nodes[i];
            const right = nodes[i + 1];

            nodes.push({
                type: 'union',
                x: (left.x + right.x) / 2,
                y: centerY
            });
        }
    }

    /*
        HIJOS 👶
    */
    const individualChildren = children.filter(child => child.parent);
    const sharedChildren = children.filter(child => !child.parent);

    individualChildren.forEach((child, index) => {
        const parentNode = nodes.find(
            node => node.type === 'member' && node.id === child.parent
        );

        if (parentNode) {
            nodes.push({
                id: child.id,
                type: 'child',
                parent: child.parent,
                x: parentNode.x + index * 140,
                y: centerY + 280
            });
        }
    });

    sharedChildren.forEach((child, index) => {
        nodes.push({
            id: child.id,
            type: 'child',
            x: (index - (sharedChildren.length - 1) / 2) * childSpacing,
            y: centerY + 280
        });
    });

    /*
        PADRES 👨‍👩‍👧
    */
    parents.forEach((parent, index) => {
        nodes.push({
            id: parent.id,
            type: 'parent',
            x: (index - (parents.length - 1) / 2) * parentSpacing,
            y: centerY - 240
        });
    });

    /*
        HERMANOS 👥
    */
    siblings.forEach((sibling, index) => {
        nodes.push({
            id: sibling.id,
            type: 'sibling',
            x: -260 - index * 180,
            y: centerY
        });
    });

    return {
        guild,
        nodes,
        members,
        children,
        parents,
        siblings,
        lovers
    };
}
