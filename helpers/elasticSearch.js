const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

const index = 'originalurl';

// client.ping((error) => {
//     if (error) {
//         console.trace('elasticsearch cluster is down!');
//     } 
//     console.log('All is well');
// });

/**Search for index */
const checkIndices = () => {
    client.indices.exists({index: index}, (err, res, status) => {
        if (res) {
            console.log('index already exists');
        } else {
            client.indices.create( {index: index}, (err, res, status) => {
                console.log(err, res, status);
                // if(res) putMapping();
            });
        }
    });
}

// /**Add mapping to index */
// async function putMapping() {
//     console.log("Creating Mapping index");
//     client.indices.putMapping({
//         index: index,
//         type: 'urldetails',
//         body: {
//         properties: { 
//             originalUrl: { type: 'text' },
//             tinyUrl: { type: 'text' },
//             created_on: { type: 'date' },
//             updated_at: { type: 'date' } }
//         }
//     }, (err,resp, status) => {
//         if (err) {
//           console.error(err, status);
//         }
//         else {
//             console.log('Successfully Created Index', status, resp);
//         }
//     });
// }

/**Add data to index */
async function saveSearchData(originalUrl, tinyUrl) {
    await client.index({
        index: index,
        refresh: true,
        body: {
        originalUrl: originalUrl,
        tinyUrl: tinyUrl
        }
    });
}

/**Search data from index */
async function getSearchData(key) {
    const result = [];
    const body = await client.search({
        index: 'originalurl',
        body: {
            query: {
                regexp: {
                    originalUrl: `.*${key}.*`
                }
            }
        }
    });
    body.hits.hits.forEach((arr) => {
        result.push(arr._source)
    });
    return result;
}

/**Delete index */
async function deleteIndex() {
    client.indices.delete({
        index: index,
    }).then(function(resp) {
        console.log("Successful query!");
        console.log(JSON.stringify(resp, null, 4));
    }, function(err) {
        console.trace(err.message);
    });
}


module.exports = {
    checkIndices,
    // putMapping,
    saveSearchData,
    getSearchData,
    deleteIndex
}