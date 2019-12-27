# Gatsby Source Sermon Audio 

Pass the following options to use this plugin:
- API Key for Sermon Audio API
- Array of fields to include in `graphql` schema from API response object

Code Example in gatsby-config.js plugin array:

```javascript
    {
      resolve: `gatsby-source-sermon-audio`,
      options: {
        apiKey: SERMON_AUDIO_API_KEY,
      }
    }
```