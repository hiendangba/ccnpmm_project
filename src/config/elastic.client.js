const { Client } = require('@opensearch-project/opensearch');

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  ssl: {
    rejectUnauthorized: false // Aiven dùng self-signed cert
  }
});

module.exports = elasticClient;