// backend/models/index.js
const sequelize = require('../config/database');

// Import all models
const User = require('./User');
const UserAuth = require('./UserAuth');
const UserPhoto = require('./UserPhoto');
const Interest = require('./Interest');
const UserInterest = require('./UserInterest');
const UserLike = require('./UserLike');
const Match = require('./Match');
const Conversation = require('./Conversation');
const Message = require('./Message');
const VirtualGift = require('./VirtualGift');
const UserSentGift = require('./UserSentGift');
const SubscriptionPlan = require('./SubscriptionPlan');
const UserSubscription = require('./UserSubscription');
const CoinPackage = require('./CoinPackage');
const Transaction = require('./Transaction');
const UserCoin = require('./UserCoin');
const ReportedUser = require('./ReportedUser');
const BlockedUser = require('./BlockedUser');
const AdminUser = require('./AdminUser'); // For admin_users table
const Staff = require('./Staff'); // For staff table (distinct from admin_users)
const ModerationLog = require('./ModerationLog');

// --- Define Associations ---

// User Associations
User.hasOne(UserAuth, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserAuth.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(UserPhoto, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'photos' });
UserPhoto.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsToMany(Interest, { through: UserInterest, foreignKey: 'user_id', otherKey: 'interest_id', as: 'interests' });
Interest.belongsToMany(User, { through: UserInterest, foreignKey: 'interest_id', otherKey: 'user_id', as: 'users' });

// User Likes (Self-referencing for users liking other users)
User.belongsToMany(User, {
    through: UserLike,
    foreignKey: 'liker_id', // User who likes
    otherKey: 'liked_id', // User who is liked
    as: 'likedUsers', // Users that this user has liked
    onDelete: 'CASCADE'
});
User.belongsToMany(User, {
    through: UserLike,
    foreignKey: 'liked_id', // User who is liked
    otherKey: 'liker_id', // User who likes
    as: 'likers', // Users who have liked this user
    onDelete: 'CASCADE'
});

// Matches (involves two users)
User.hasMany(Match, { foreignKey: 'user1_id', as: 'matchesAsUser1', onDelete: 'CASCADE' });
User.hasMany(Match, { foreignKey: 'user2_id', as: 'matchesAsUser2', onDelete: 'CASCADE' });
Match.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Match.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });

// Conversations (involves two users)
User.hasMany(Conversation, { foreignKey: 'user1_id', as: 'conversationsAsUser1', onDelete: 'CASCADE' });
User.hasMany(Conversation, { foreignKey: 'user2_id', as: 'conversationsAsUser2', onDelete: 'CASCADE' });
Conversation.belongsTo(User, { foreignKey: 'user1_id', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user2_id', as: 'user2' });

// Messages (sender is a user, belongs to a conversation)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages', onDelete: 'CASCADE' }); // User who sent the message
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id', as: 'conversation' });

// Conversation's last_message_id (circular dependency handling)
// Define these associations with constraints: false or ensure migration order handles it.
// For model definition, it's okay. Sequelize handles this by not immediately creating DB constraints.
Conversation.belongsTo(Message, { foreignKey: 'last_message_id', as: 'lastMessage', constraints: false });
// A message might be the last message of one conversation
// Message.hasOne(Conversation, { foreignKey: 'last_message_id', as: 'conversationWhereLast', constraints: false }); // Usually not needed this way

// User Sent Gifts
User.hasMany(UserSentGift, { foreignKey: 'sender_id', as: 'sentGifts', onDelete: 'CASCADE' });
UserSentGift.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(UserSentGift, { foreignKey: 'receiver_id', as: 'receivedGifts', onDelete: 'CASCADE' });
UserSentGift.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

UserSentGift.belongsTo(VirtualGift, { foreignKey: 'gift_id', as: 'gift' });
VirtualGift.hasMany(UserSentGift, { foreignKey: 'gift_id', as: 'timesSent' }); // How many times this gift was sent

// User Subscriptions
User.hasMany(UserSubscription, { foreignKey: 'user_id', as: 'subscriptions', onDelete: 'CASCADE' });
UserSubscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserSubscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'plan' });
SubscriptionPlan.hasMany(UserSubscription, { foreignKey: 'plan_id', as: 'userSubscriptions' });

// Transactions
User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
// Note: transaction.related_item_id is polymorphic and cannot be directly associated with a single table via Sequelize standard associations.
// This would typically be handled at the application logic level or by using separate columns for each type of related item ID.

// User Coins
User.hasOne(UserCoin, { foreignKey: 'user_id', as: 'coinBalance', onDelete: 'CASCADE' });
UserCoin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reported Users
User.hasMany(ReportedUser, { foreignKey: 'reporter_id', as: 'reportsMade', onDelete: 'CASCADE' });
ReportedUser.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });

User.hasMany(ReportedUser, { foreignKey: 'reported_user_id', as: 'reportsReceived', onDelete: 'CASCADE' });
ReportedUser.belongsTo(User, { foreignKey: 'reported_user_id', as: 'reportedUser' });

// Blocked Users
User.belongsToMany(User, {
    through: BlockedUser,
    foreignKey: 'blocker_id', // User who blocks
    otherKey: 'blocked_id',  // User who is blocked
    as: 'blockedUsers',      // Users that this user has blocked
    onDelete: 'CASCADE'
});
User.belongsToMany(User, {
    through: BlockedUser,
    foreignKey: 'blocked_id',  // User who is blocked
    otherKey: 'blocker_id', // User who blocks
    as: 'blockers',         // Users who have blocked this user
    onDelete: 'CASCADE'
});


// Staff and ModerationLog Associations
Staff.hasMany(ModerationLog, { foreignKey: 'staff_id', as: 'moderationLogs' });
ModerationLog.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staffMember' });

ModerationLog.belongsTo(User, { foreignKey: 'target_user_id', as: 'targetUser', onDelete: 'SET NULL' });
// User.hasMany(ModerationLog, { foreignKey: 'target_user_id', as: 'moderationEntriesAgainst' }); // If needed

// AdminUser - currently no direct associations to other tables listed in the SQL,
// but could be associated with ModerationLog if AdminUser also performs moderation.
// For now, assuming Staff model is used for moderation logs as per correction.


// Export all models and sequelize instance
module.exports = {
    sequelize, // The Sequelize instance
    User,
    UserAuth,
    UserPhoto,
    Interest,
    UserInterest,
    UserLike,
    Match,
    Conversation,
    Message,
    VirtualGift,
    UserSentGift,
    SubscriptionPlan,
    UserSubscription,
    CoinPackage,
    Transaction,
    UserCoin,
    ReportedUser,
    BlockedUser,
    AdminUser, // For admin_users table
    Staff,     // For staff table
    ModerationLog,
};
