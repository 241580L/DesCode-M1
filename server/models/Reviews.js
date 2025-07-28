// server/models/Review.js

module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define("Review", {
        id: { // {PK}
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        stars: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 }
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        upvotes: {
            type: DataTypes.INTEGER,
            allowNull: true, // Optional, remove if not needed
            defaultValue: 0
        },
        downvotes: {
            type: DataTypes.INTEGER,
            allowNull: true, // Optional, remove if not needed
            defaultValue: 0
        },
        postDateTime: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        editDateTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted: { // Implementing Soft Delete
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // FOREIGN KEYS
        reviewerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' }
        }
    }, {
        tableName: 'reviews',
        timestamps: false // because you define your own Post/EditDateTime
    });

    Review.associate = (models) => {
        Review.belongsTo(models.User, {
            foreignKey: 'reviewerId',
            as: 'reviewer'
        });

        Review.hasMany(models.ReviewReply, {
            foreignKey: 'ReviewID',
            as: 'replies'
        });

        Review.hasMany(models.ReviewVote, {
            foreignKey: 'ReviewID',
            as: 'reviewVotes'
        });
    };


    return Review;
};
