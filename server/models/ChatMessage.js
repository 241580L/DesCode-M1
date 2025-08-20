// server/models/ChatMessage.js
module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define("ChatMessage", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        chatId: { type: DataTypes.INTEGER, allowNull: false },
        sender: { type: DataTypes.STRING, allowNull: false }, // 'user' or 'ai'
        contents: { type: DataTypes.TEXT, allowNull: true },  // The text content of message
        file: { type: DataTypes.JSON, allowNull: true },     // filename(s)
        datePosted: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, { tableName: 'chat_messages' });

    return ChatMessage;
};
