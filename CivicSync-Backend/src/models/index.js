const User = require('./user.model');
const Issue = require('./issue.model');
const Vote = require('./vote.model');
const Media = require('./media.model');

// User - Issue relationship
User.hasMany(Issue, { foreignKey: 'user_id' });
Issue.belongsTo(User, { foreignKey: 'user_id' });

// User - Vote relationship
User.hasMany(Vote, { foreignKey: 'user_id' });
Vote.belongsTo(User, { foreignKey: 'user_id' });

// Issue - Vote relationship
Issue.hasMany(Vote, { foreignKey: 'issue_id' });
Vote.belongsTo(Issue, { foreignKey: 'issue_id' });

// Issue - Media relationship
Issue.hasMany(Media, { foreignKey: 'issue_id' });
Media.belongsTo(Issue, { foreignKey: 'issue_id' });

module.exports = {
    User,
    Issue,
    Vote,
    Media
}; 