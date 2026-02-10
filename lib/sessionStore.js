export const sessionStore = {};

export const createSession = (user) => {
const sessionId = crypto.randomUUID();
sessionStore[sessionId] = {
user,
createdAt: Date.now(),
lastActive: Date.now()
};
return sessionId;
};

export const getSession = (sessionId) => {
const session = sessionStore[sessionId];
if (!session) return null;

// Check timeout (15 นาที = 900,000 ms)
const now = Date.now();
if (now - session.lastActive > 15 * 60 * 1000) {
delete sessionStore[sessionId];
return null;
}

// Update lastActive
session.lastActive = now;
return session;
};

export const deleteSession = (sessionId) => {
delete sessionStore[sessionId];
};

