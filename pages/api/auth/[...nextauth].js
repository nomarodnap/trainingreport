import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import fetchUserFromDatabase from './fetchUser'

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'example@example.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const { email, password } = credentials;

                // ตรวจสอบผู้ใช้จากฐานข้อมูล
                const user = await fetchUserFromDatabase(email, password);
                if (user) {
                    return user;
                }

                // หากไม่มีผู้ใช้ที่ตรงกับข้อมูลนี้
                return null;
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login', // ระบุหน้าเข้าสู่ระบบ
    },
});
