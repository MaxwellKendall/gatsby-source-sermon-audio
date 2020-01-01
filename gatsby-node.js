const axios = require('axios');

const defaultFieldsToInclude = ['bibleText', 'fullTitle', 'downloadCount', 'eventType', 'media', 'preachDate', 'series', 'speaker'];
const requiredFields = ['id', 'internal', 'slug'];
const defaultOptions = { fieldsToInclude: defaultFieldsToInclude, slugField: 'fullTitle' };

const getSlug = (sermon, slugField) => {
    return sermon[slugField].split(" ").map(word => word.toLowerCase()).join("-");
};

const processSermons = (sermon, fieldsToInclude = defaultFieldsToInclude, slugField) => {
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

const getSermons = (apiKey, query = '/v2/node/sermons', acc = []) => {
    return axios.get(`https://api.sermonaudio.com${query}`, {
        headers: {
            'X-Api-Key': apiKey
        }
    })
    .then((resp) => {
        const { data: { results, next }} = resp;
        if (next) {
            return getSermons(apiKey, next, [...acc, ...results])
        }
        return [...acc, ...results];
    });
}

exports.sourceNodes = async ({ actions }, options = defaultOptions) => {
    const { apiKey, fieldsToInclude, slugField } = { ...defaultOptions, ...options };
    const { createNode } = actions;

    // getting the list of items for calendar
    const sermons = await getSermons(apiKey);
  
    // Process data into nodes.
    sermons
        .map(sermon => ({
            ...sermon,
            id: sermon.sermonID,
            slug: getSlug(sermon, slugField),
            internal: {
                contentDigest: sermon.sermonID,
                type: 'Sermon'
            }
        }))
        .forEach(sermon => createNode(processSermons(sermon, fieldsToInclude, slugField)));
  
    // We're done, return.
    return;
};
