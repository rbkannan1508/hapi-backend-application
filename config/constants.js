const cookie_options = {
    ttl: 1 * 24 * 60 * 60 * 1000, // expires after a day
    encoding: 'none',
    isSameSite: false,
    isSecure: true,
    isHttpOnly: false,
    clearInvalid: false,
    strictHeader: true,
    path: '/'
};

const redirectUrl = 'http://localhost:3010/redirect/';

module.exports = {
    cookie_options,
    redirectUrl
}