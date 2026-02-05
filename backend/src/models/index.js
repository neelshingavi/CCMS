const User = require('./User');
const Event = require('./Event');
const Election = require('./Election');
const Vote = require('./Vote');
const Attendance = require('./Attendance');
const Feedback = require('./Feedback');
const Certificate = require('./Certificate');

// Define Associations

// NOTE: For demo mode, Attendance and Certificate use wallet_hash as pseudo-user-id
// We DO NOT create FK constraints from Attendance/Certificate to User
// This allows wallet-based auth without JWT user registration

// Event -> Attendance
Event.hasMany(Attendance, { foreignKey: 'event_id', as: 'attendances' });
Attendance.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Event -> Certificate
Event.hasMany(Certificate, { foreignKey: 'event_id', as: 'certificates' });
Certificate.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Event -> Feedback (Note: NO direct user association for privacy)
Event.hasMany(Feedback, { foreignKey: 'event_id', as: 'feedbacks' });
Feedback.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// User -> Vote (voting still uses traditional auth)
User.hasMany(Vote, { foreignKey: 'user_id', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Election -> Vote
Election.hasMany(Vote, { foreignKey: 'election_id', as: 'votes' });
Vote.belongsTo(Election, { foreignKey: 'election_id', as: 'election' });

// User -> Election (creator)
User.hasMany(Election, { foreignKey: 'created_by', as: 'createdElections' });
Election.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = {
    User,
    Event,
    Election,
    Vote,
    Attendance,
    Feedback,
    Certificate
};
