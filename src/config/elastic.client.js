const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_URL,
    auth: {
        username: process.env.ELASTICSEARCH_USER,
        password: process.env.ELASTICSEARCH_PASSWORD
    },
    tls: {
    rejectUnauthorized: false // bỏ qua self-signed cert (chỉ dev/test)
    }
});

module.exports = elasticClient;