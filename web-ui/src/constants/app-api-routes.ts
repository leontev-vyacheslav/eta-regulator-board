export default {
    host: process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`,

    accountSignIn: '/sign-in',
    accountSignOut: '/sign-out',
    accountAuthCheck: '/auth-check',
    accountOwnerInfo: '/owner-info',

    tests: '/api/tests',
    rtc: '/api/rtc',

    gpio: '/api/gpio',
    adc: '/api/adc',

    regulatorSettings: '/api/regulator-settings'
};
