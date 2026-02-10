import { verify } from 'jsonwebtoken';

export default function handler(req, res) {
const { token } = req.cookies;

if (!token) {
return res.status(401).json({ message: 'Not authenticated' });
}

try {
const decoded = verify(token, process.env.JWT_SECRET);
return res.status(200).json({ user: decoded });
} catch (error) {
return res.status(401).json({ message: 'Invalid token' });
}
}

