export default {
    host: process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : `http://${window.location.hostname}:5000`,

    accountSignIn: '/sign-in',
    accountSignOut: '/sign-out',
    accountAuthCheck: '/auth-check',
    accountOwnerInfo: '/owner-info',

    rtc: '/api/rtc',

    gpio: '/api/gpio',

    adc: '/api/adc',
    temperature: '/api/temperature',

    dac: '/api/dac',

    archives: '/api/archives',

    accounts: '/api/accounts',

    regulatorSettings: '/api/regulator-settings'
};
