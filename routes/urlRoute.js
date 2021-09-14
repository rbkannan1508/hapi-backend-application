const urlController = require('../controllers/urlController');

const tinyurl = {
    method: 'GET',
    path: '/tinyurl',
    handler: urlController.tinyurl
}

const shortenurl = {
    method: 'POST',
    path: '/shorten-url',
    handler: urlController.shortenurl
}

const listAllShortenedUrls = {
    method: 'POST',
    path: '/list-all-shortenedurls',
    handler: urlController.listAllShortenedUrls
}

const redirectURL = {
    method: 'GET',
    path: '/redirect/{urlkey}',
    handler: urlController.redirectURL                          
}

const deleteURL = {
    method: 'GET',
    path: '/delete-url/{urlkey}',
    handler: urlController.deleteURL                          
}

const searchURL = {
    method: 'GET',
    path: `/search-url`,
    handler: urlController.searchURL                          
}

module.exports = [
    tinyurl,
    shortenurl,
    listAllShortenedUrls,
    redirectURL,
    deleteURL,
    searchURL
]