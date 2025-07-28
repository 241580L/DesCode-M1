// server/models/ReplyVote.js

module.exports = (sequelize, DataTypes) => {
    const ReplyVote = sequelize.define("ReplyVote", {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ReplyID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        Upvote: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'reply_votes',
        timestamps: false
    });

    ReplyVote.associate = (models) => {
        ReplyVote.belongsTo(models.User, { foreignKey: 'UserID' });
        ReplyVote.belongsTo(models.ReviewReply, { foreignKey: 'ReplyID' });
    };

    return ReplyVote;
};
