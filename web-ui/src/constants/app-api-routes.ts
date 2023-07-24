export default {
    host: process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : 'https://10.10.10.1:5000',
    accountSignIn: '/api/sign-in',
    accountSignOut: '/api/sign-out',
    test: '/api/test',
};
