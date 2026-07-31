export async function calculateLayout(guild, family) {
    // Normalizador seguro para aceptar objetos {id: ...} o strings 'ID'
    const normalize = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map(item => typeof item === 'object' ? item : { id: item }).filter(item => item && item.id);
    };

    // Sincronizar 'members' con 'spouses' por compatibilidad de nombres
    const rawMembers = family.members || family.spouses || [];
    const spousesList = Array.isArray(rawMembers) ? rawMembers : [];
    
    // Identificar el usuario principal
    const targetUserId = family.targetUser || family.userId || family.id || family.rootUser?.id;
    
    // 🔧 FIX: Garantizar que el usuario principal (tú) SIEMPRE esté en la lista de miembros
    const spouseIds = spousesList.map(m => typeof m === 'object' ? m.id : m);
    let members = [];

    if (targetUserId) {
        members.push(targetUserId);
    }

    // Añadimos las parejas evitando duplicados
    for (const spouseId of spouseIds) {
        if (spouseId && !members.includes(spouseId)) {
            members.push(spouseId);
        }
    }

    const children = normalize(family.children);
    const parents = normalize(family.parents);
    const siblings = normalize(family.siblings);
    const lovers = normalize(family.lovers);

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
        MIEMBROS PRINCIPALES 💍 (Tú + Pareja)
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

    // 🛡️ GARANTÍA ANTI-CRASH: Si la estructura aún no tiene ningún nodo, agregamos 1 por defecto
    if (nodes.length === 0 && targetUserId) {
        nodes.push({
            id: targetUserId,
            type: 'member',
            x: 0,
            y: centerY
        });
    }

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
