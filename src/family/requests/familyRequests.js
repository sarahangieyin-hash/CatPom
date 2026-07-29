const requests = new Map();

export function createFamilyRequest(type, data = {}) {

    const id = `family_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const request = {

        id,

        type,

        ...data,

        accepted: [],

        rejected: [],

        createdAt: Date.now()

    };

    requests.set(id, request);

    return request;

}

export function getFamilyRequest(id) {

    return requests.get(id);

}

export function acceptFamilyRequest(id, userId) {

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

export function rejectFamilyRequest(id, userId) {

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

export function deleteFamilyRequest(id) {

    requests.delete(id);

}

export function clearExpiredRequests(maxAge) {

    const now = Date.now();

    for (const [id, request] of requests) {

        if (now - request.createdAt >= maxAge) {

            requests.delete(id);

        }

    }

}
