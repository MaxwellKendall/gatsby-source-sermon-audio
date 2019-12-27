const axios = require('axios');

const defaultFieldsToInclude = ['bibleText', 'fullTitle', 'downloadCount', 'eventType', 'media', 'preachDate', 'series', 'speaker'];
const requiredFields = ['id', 'internal'];
const defaultOptions = { fieldsToInclude: defaultFieldsToInclude };

const processSermons = (sermon, fieldsToInclude = defaultFieldsToInclude) => {
    return Object.keys(sermon)
        .reduce((acc, key) => {
            if (fieldsToInclude.concat(requiredFields).includes(key)) {
                return {
                    ...acc,
                    [key]: sermon[key]
                };
            }
            return acc;
        }, {});
};

const getSermons = (apiKey) => {
    return axios.get('https://api.sermonaudio.com/v2/node/sermons', {
        headers: {
            'X-Api-Key': apiKey
        }
    });
}

exports.sourceNodes = async ({ actions }, options = defaultOptions) => {
    const { apiKey, fieldsToInclude } = { ...defaultOptions, ...options };
    const { createNode } = actions;

    // getting the list of items for calendar
    const { data: { results }} = await getSermons(apiKey);
  
    // Process data into nodes.
    results
        .map(sermon => ({
            ...sermon,
            id: sermon.sermonID,
            internal: {
                contentDigest: sermon.sermonID,
                type: 'Sermon'
            }
        }))
        .forEach(sermon => createNode(processSermons(sermon, fieldsToInclude)));
  
    // We're done, return.
    return;
};
