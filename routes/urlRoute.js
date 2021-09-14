const urlController = require('../controllers/urlController');

const tinyurl = {
    method: 'GET',
    path: '/tinyurl',
    handler: urlController.tinyurl
}

const shortenurl = {
    method: 'POST',
    path: '/api/shorten-url',
    handler: urlController.shortenurl
}

const listAllShortenedUrls = {
    method: 'POST',
    path: '/api/list-all-shortenedurls',
    handler: urlController.listAllShortenedUrls
}

const redirectURL = {
    method: 'GET',
    path: '/api/redirect/{urlkey}',
    handler: urlController.redirectURL                          
}

const deleteURL = {
    method: 'GET',
    path: '/api/delete-url/{urlkey}',
    handler: urlController.deleteURL                          
}

module.exports = [
    tinyurl,
    shortenurl,
    listAllShortenedUrls,
    redirectURL,
    deleteURL
]