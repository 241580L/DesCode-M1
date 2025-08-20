// server/models/Chat.js
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define("Chat", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    allowExternal: { type: DataTypes.BOOLEAN, defaultValue: false },
    title: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'New Chat' },
    dateCreated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    dateLastMessage: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'chats' });

  Chat.associate = models => {
    Chat.hasMany(models.ChatMessage, { foreignKey: 'chatId', as: 'Messages' });
  };

  return Chat;
};
