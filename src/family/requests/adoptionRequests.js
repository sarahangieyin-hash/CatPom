const requests = new Map();

export function createAdoptionRequest(ownerId, childId, unionId) {

    const id = `adoption_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    requests.set(id, {
        id,
        ownerId,
        childId,
        unionId,
        accepted: [ownerId],
        rejected: [],
        createdAt: Date.now()
    });

    return requests.get(id);

}

export function getAdoptionRequest(id) {

    return requests.get(id);

}

export function acceptAdoptionRequest(id, userId) {

    const request = requests.get(id);

    if (!request) return null;

    if (!request.accepted.includes(userId)) {

        request.accepted.push(userId);

    }

    request.rejected = request.rejected.filter(
        id => id !== userId
    );

    return request;

}

export function rejectAdoptionRequest(id, userId) {

    const request = requests.get(id);

    if (!request) return null;

    if (!request.rejected.includes(userId)) {

        request.rejected.push(userId);

    }

    request.accepted = request.accepted.filter(
        id => id !== userId
    );

    return request;

}

export function deleteAdoptionRequest(id) {

    requests.delete(id);

}
