// server/models/ReviewReply.js
// Assuming ReplierID references AdminID in an Admin table (you’d need an Admin model).
// If it references UserID, replace Admin with User in the association.

module.exports = (sequelize, DataTypes) => {
  const ReviewReply = sequelize.define("ReviewReply", {
    ReplyID: { // {PK}
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Content: {
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
    PostDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    EditDateTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ReviewID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ReplierID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAI: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'review_replies',
    timestamps: false
  });

  ReviewReply.associate = (models) => {
    ReviewReply.belongsTo(models.Review, {
      foreignKey: 'ReviewID',
      as: 'review'
    });

    ReviewReply.belongsTo(models.User, {
      foreignKey: 'ReplierID',
      as: 'Replier'
    });

    ReviewReply.hasMany(models.ReplyVote, {
      foreignKey: 'ReplyID',
      as: 'replyVotes'
    });
    // If Admin does not exist, and you use User instead:
    // ReviewReply.belongsTo(models.User, { foreignKey: 'ReplierID', as: 'Replier' });
  };

  return ReviewReply;
};