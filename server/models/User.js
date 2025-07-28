// server/models/User.js

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Add any other fields as needed (e.g., firstName, lastName)
  }, {
    tableName: 'users',
    timestamps: true // Adds createdAt and updatedAt columns
  });

  User.associate = (models) => {
    User.hasMany(models.Review, {
      foreignKey: 'reviewerId',
      as: 'Reviews'
    });

    // ReviewVote and ReplyVote associations
    User.hasMany(models.ReviewVote, {
      foreignKey: 'UserID',
      as: 'ReviewVotes'
    });

    User.hasMany(models.ReplyVote, {
      foreignKey: 'UserID',
      as: 'ReplyVotes'
    });
  };

  return User;
};