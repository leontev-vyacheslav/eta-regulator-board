export default {
    host: process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`,
    accountSignIn: '/sign-in',
    accountSignOut: '/sign-out',

    tests: '/api/tests',
    rtc: '/api/rtc',
    regulatorSettings: '/api/regulator-settings'
};
