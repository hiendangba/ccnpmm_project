const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/user.model');
const Post = require('./src/models/post.model');
const Message = require('./src/models/message.model');
const Conversation = require('./src/models/conversation.model');
const Friendship = require('./src/models/friendship.model');
const FriendRequest = require('./src/models/friendrequest.model');
require('dotenv').config();

async function seedData() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ccnpmm_project');
        console.log('Connected to MongoDB');

        // Xóa data cũ (optional)
        await User.deleteMany({});
        await Post.deleteMany({});
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        await Friendship.deleteMany({});
        await FriendRequest.deleteMany({});
        console.log('Cleared existing data');

        // Tạo users
        const users = [
            {
                name: 'Nguyễn Văn Admin',
                mssv: 'ADMIN001',
                email: 'admin@ute.edu.vn',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                gender: 'nam',
                bio: 'Quản trị viên hệ thống',
                address: 'TP.HCM',
                avatar: 'https://via.placeholder.com/150/007bff/ffffff?text=Admin'
            },
            {
                name: 'Trần Thị Hoa',
                mssv: 'SV001',
                email: 'hoa@ute.edu.vn',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
                gender: 'nữ',
                bio: 'Sinh viên năm 3 ngành Công nghệ thông tin',
                address: 'Quận 1, TP.HCM',
                avatar: 'https://via.placeholder.com/150/28a745/ffffff?text=Hoa'
            },
            {
                name: 'Lê Minh Tuấn',
                mssv: 'SV002',
                email: 'tuan@ute.edu.vn',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
                gender: 'nam',
                bio: 'Sinh viên năm 2 ngành Kỹ thuật phần mềm',
                address: 'Quận 3, TP.HCM',
                avatar: 'https://via.placeholder.com/150/dc3545/ffffff?text=Tuan'
            },
            {
                name: 'Phạm Thị Lan',
                mssv: 'SV003',
                email: 'lan@ute.edu.vn',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
                gender: 'nữ',
                bio: 'Sinh viên năm 4 ngành An toàn thông tin',
                address: 'Quận 7, TP.HCM',
                avatar: 'https://via.placeholder.com/150/ffc107/ffffff?text=Lan'
            },
            {
                name: 'Hoàng Văn Đức',
                mssv: 'SV004',
                email: 'duc@ute.edu.vn',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
                gender: 'nam',
                bio: 'Sinh viên năm 1 ngành Khoa học máy tính',
                address: 'Quận 10, TP.HCM',
                avatar: 'https://via.placeholder.com/150/17a2b8/ffffff?text=Duc'
            },
            {
                name: 'Nguyễn Thị Mai',
                mssv: 'SV005',
                email: 'mai@ute.edu.vn',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
                gender: 'nữ',
                bio: 'Sinh viên năm 3 ngành Mạng máy tính',
                address: 'Quận 5, TP.HCM',
                avatar: 'https://via.placeholder.com/150/6f42c1/ffffff?text=Mai'
            }
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Tạo posts
        const posts = [
            {
                userId: createdUsers[1]._id, // Hoa
                content: 'Hôm nay học React rất thú vị! Ai có kinh nghiệm về hooks không?',
                images: ['https://via.placeholder.com/400x300/007bff/ffffff?text=React+Learning']
            },
            {
                userId: createdUsers[2]._id, // Tuấn
                content: 'Vừa hoàn thành project Node.js! Cảm ơn các bạn đã hỗ trợ.',
                images: ['https://via.placeholder.com/400x300/28a745/ffffff?text=NodeJS+Project']
            },
            {
                userId: createdUsers[3]._id, // Lan
                content: 'Chia sẻ một số tips về bảo mật web application. Mong nhận được feedback!',
                images: ['https://via.placeholder.com/400x300/dc3545/ffffff?text=Security+Tips']
            },
            {
                userId: createdUsers[4]._id, // Đức
                content: 'Lần đầu học lập trình, có bạn nào có thể hướng dẫn không?',
                images: []
            },
            {
                userId: createdUsers[5]._id, // Mai
                content: 'Tham gia hackathon tuần tới! Team nào cần member không?',
                images: ['https://via.placeholder.com/400x300/ffc107/ffffff?text=Hackathon']
            },
            {
                userId: createdUsers[1]._id, // Hoa
                content: 'Chia sẻ kinh nghiệm học JavaScript từ zero to hero!',
                images: ['https://via.placeholder.com/400x300/17a2b8/ffffff?text=JavaScript+Tips']
            }
        ];

        const createdPosts = await Post.insertMany(posts);
        console.log(`✅ Created ${createdPosts.length} posts`);

        // Tạo friend requests (accepted friendships)
        const friendRequests = [
            {
                senderId: createdUsers[1]._id, // Hoa
                receiverId: createdUsers[2]._id, // Tuấn
                status: 'accepted',
                message: 'Chào bạn!'
            },
            {
                senderId: createdUsers[1]._id, // Hoa
                receiverId: createdUsers[3]._id, // Lan
                status: 'accepted',
                message: 'Kết bạn nhé!'
            },
            {
                senderId: createdUsers[2]._id, // Tuấn
                receiverId: createdUsers[4]._id, // Đức
                status: 'accepted',
                message: 'Chào bạn mới!'
            },
            {
                senderId: createdUsers[3]._id, // Lan
                receiverId: createdUsers[5]._id, // Mai
                status: 'accepted',
                message: 'Học cùng nhau nhé!'
            },
            {
                senderId: createdUsers[4]._id, // Đức
                receiverId: createdUsers[5]._id, // Mai
                status: 'accepted',
                message: 'Chào bạn!'
            }
        ];

        const createdFriendRequests = await FriendRequest.insertMany(friendRequests);
        console.log(`✅ Created ${createdFriendRequests.length} friend requests (accepted)`);

        // Tạo conversations (theo đúng format của hệ thống)
        const conversations = [
            {
                members: [createdUsers[1]._id, createdUsers[2]._id], // Hoa - Tuấn
                createdBy: createdUsers[1]._id,
                isGroup: false,
                name: null
            },
            {
                members: [createdUsers[1]._id, createdUsers[3]._id], // Hoa - Lan
                createdBy: createdUsers[1]._id,
                isGroup: false,
                name: null
            },
            {
                members: [createdUsers[2]._id, createdUsers[4]._id], // Tuấn - Đức
                createdBy: createdUsers[2]._id,
                isGroup: false,
                name: null
            }
        ];

        const createdConversations = await Conversation.insertMany(conversations);
        console.log(`✅ Created ${createdConversations.length} conversations`);

        // Tạo messages
        const messages = [
            {
                conversationId: createdConversations[0]._id,
                senderId: createdUsers[1]._id.toString(),
                content: 'Chào Tuấn! Bạn có thể giúp mình về React hooks không?',
                type: 'text'
            },
            {
                conversationId: createdConversations[0]._id,
                senderId: createdUsers[2]._id.toString(),
                content: 'Chào Hoa! Tất nhiên rồi, mình sẽ giúp bạn.',
                type: 'text'
            },
            {
                conversationId: createdConversations[1]._id,
                senderId: createdUsers[1]._id.toString(),
                content: 'Lan ơi, bạn có tài liệu về bảo mật web không?',
                type: 'text'
            },
            {
                conversationId: createdConversations[1]._id,
                senderId: createdUsers[3]._id.toString(),
                content: 'Có chứ! Mình sẽ gửi cho bạn sau.',
                type: 'text'
            },
            {
                conversationId: createdConversations[2]._id,
                senderId: createdUsers[2]._id.toString(),
                content: 'Đức ơi, bạn có muốn tham gia project cùng mình không?',
                type: 'text'
            }
        ];

        const createdMessages = await Message.insertMany(messages);
        console.log(`✅ Created ${createdMessages.length} messages`);

        console.log('\n🎉 Data seeding completed successfully!');
        console.log('\n📋 Test accounts:');
        console.log('Admin:');
        console.log('  MSSV: ADMIN001');
        console.log('  Password: admin123');
        console.log('\nUsers:');
        console.log('  MSSV: SV001, Password: 123456 (Hoa)');
        console.log('  MSSV: SV002, Password: 123456 (Tuấn)');
        console.log('  MSSV: SV003, Password: 123456 (Lan)');
        console.log('  MSSV: SV004, Password: 123456 (Đức)');
        console.log('  MSSV: SV005, Password: 123456 (Mai)');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Chạy script
seedData();
