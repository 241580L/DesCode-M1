// server/models/ReviewVote.js

module.exports = (sequelize, DataTypes) => {
    const ReviewVote = sequelize.define("ReviewVote", {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ReviewID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        Upvote: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }, {
        tableName: 'review_votes',
        timestamps: false
    });

    ReviewVote.associate = (models) => {
        ReviewVote.belongsTo(models.User, { foreignKey: 'UserID' });
        ReviewVote.belongsTo(models.Review, { foreignKey: 'ReviewID' });
    };

    return ReviewVote;
};
