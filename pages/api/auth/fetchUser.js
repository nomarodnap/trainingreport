import db from '../../../lib/db'; // โมดูลสำหรับเชื่อมฐานข้อมูล

async function fetchUserFromDatabase(email, password) {
    const [user] = await db.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
    );
    return user || null;
}

export default fetchUserFromDatabase;
