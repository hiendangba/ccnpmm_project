const elasticClient = require('../config/elastic.client');

class ElasticsearchService {
    constructor() {
        this.isConnected = false;
        this.checkConnection();
    }

    // Kiểm tra kết nối Elasticsearch
    async checkConnection() {
        try {
            await elasticClient.ping();
            this.isConnected = true;
            console.log('✅ Elasticsearch connected successfully');
        } catch (error) {
            this.isConnected = false;
            console.log('⚠️ Elasticsearch connection failed, continuing without Elasticsearch');
        }
    }

    // Tạo index nếu chưa tồn tại
    async createIndexIfNotExists(indexName, mapping = {}) {
        if (!this.isConnected) return;

        try {
            const exists = await elasticClient.indices.exists({ index: indexName });
            if (!exists) {
                await elasticClient.indices.create({
                    index: indexName,
                    body: {
                        mappings: mapping
                    }
                });
                console.log(`✅ Created index: ${indexName}`);
            }
        } catch (error) {
            console.log(`⚠️ Failed to create index ${indexName}:`, error.message);
            this.isConnected = false;
        }
    }

    // Index document (tạo/cập nhật)
    async indexDocument(indexName, id, document) {
        if (!this.isConnected) return;

        try {
            await elasticClient.index({
                index: indexName,
                id: id,
                body: document
            });
            console.log(`✅ Indexed document ${id} to ${indexName}`);
        } catch (error) {
            console.log(`⚠️ Failed to index document ${id}:`, error.message);
            // Không throw error, chỉ log và tiếp tục
        }
    }

    // Xóa document
    async deleteDocument(indexName, id) {
        if (!this.isConnected) return;

        try {
            await elasticClient.delete({
                index: indexName,
                id: id
            });
            console.log(`✅ Deleted document ${id} from ${indexName}`);
        } catch (error) {
            console.log(`⚠️ Failed to delete document ${id}:`, error.message);
        }
    }

    // Tìm kiếm
    async search(indexName, query) {
        if (!this.isConnected) {
            console.log('⚠️ Elasticsearch not available, returning empty results');
            return { hits: { hits: [], total: { value: 0 } } };
        }

        try {
            const result = await elasticClient.search({
                index: indexName,
                body: query
            });
            return result.body;
        } catch (error) {
            console.log(`⚠️ Search failed:`, error.message);
            return { hits: { hits: [], total: { value: 0 } } };
        }
    }

    // Bulk operations
    async bulkIndex(indexName, documents) {
        if (!this.isConnected) return;

        try {
            const body = [];
            documents.forEach(doc => {
                body.push({
                    index: {
                        _index: indexName,
                        _id: doc.id
                    }
                });
                body.push(doc.data);
            });

            await elasticClient.bulk({ body });
            console.log(`✅ Bulk indexed ${documents.length} documents to ${indexName}`);
        } catch (error) {
            console.log(`⚠️ Bulk index failed:`, error.message);
        }
    }

    // Đồng bộ tất cả users từ MongoDB sang Elasticsearch
    async syncAllUsers() {
        if (!this.isConnected) return;

        try {
            const User = require('../models/user.model');
            const users = await User.find({}).select('-password');
            
            await this.createIndexIfNotExists('users', {
                properties: {
                    name: { type: 'text' },
                    email: { type: 'keyword' },
                    mssv: { type: 'keyword' },
                    bio: { type: 'text' },
                    address: { type: 'text' },
                    gender: { type: 'keyword' },
                    role: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            const documents = users.map(user => ({
                id: user._id.toString(),
                data: {
                    name: user.name,
                    email: user.email,
                    mssv: user.mssv,
                    bio: user.bio,
                    address: user.address,
                    gender: user.gender,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }));

            await this.bulkIndex('users', documents);
            console.log(`✅ Synced ${users.length} users to Elasticsearch`);
        } catch (error) {
            console.log(`⚠️ Failed to sync users:`, error.message);
        }
    }

    // Đồng bộ tất cả posts từ MongoDB sang Elasticsearch
    async syncAllPosts() {
        if (!this.isConnected) return;

        try {
            const Post = require('../models/post.model');
            const posts = await Post.find({ deleted: { $ne: true } })
                .populate('userId', 'name mssv')
                .sort({ createdAt: -1 });

            await this.createIndexIfNotExists('posts', {
                properties: {
                    content: { type: 'text' },
                    images: { type: 'keyword' },
                    userId: { type: 'keyword' },
                    userName: { type: 'text' },
                    userMssv: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' }
                }
            });

            const documents = posts.map(post => ({
                id: post._id.toString(),
                data: {
                    content: post.content,
                    images: post.images,
                    userId: post.userId._id.toString(),
                    userName: post.userId.name,
                    userMssv: post.userId.mssv,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
                }
            }));

            await this.bulkIndex('posts', documents);
            console.log(`✅ Synced ${posts.length} posts to Elasticsearch`);
        } catch (error) {
            console.log(`⚠️ Failed to sync posts:`, error.message);
        }
    }

    // Đồng bộ tất cả data
    async syncAllData() {
        console.log('🔄 Starting data synchronization...');
        await this.syncAllUsers();
        await this.syncAllPosts();
        console.log('✅ Data synchronization completed');
    }

    // Reconnect nếu mất kết nối
    async reconnect() {
        console.log('🔄 Attempting to reconnect to Elasticsearch...');
        await this.checkConnection();
        if (this.isConnected) {
            await this.syncAllData();
        }
    }
}

// Singleton instance
const elasticsearchService = new ElasticsearchService();

module.exports = elasticsearchService;
