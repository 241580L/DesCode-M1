module.exports = (sequelize, DataTypes) => {
  const CodeOfPractices = sequelize.define("CodeOfPractices", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contents: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    uploader: {   // NEW FIELD
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    editor: {     // NEW FIELD
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dateUploaded: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dateEdited: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'code_of_practices'
  });

  // ✅ Define relationships
  CodeOfPractices.associate = (models) => {
    CodeOfPractices.belongsTo(models.User, { foreignKey: "uploader", as: "Uploader" });
    CodeOfPractices.belongsTo(models.User, { foreignKey: "editor", as: "Editor" });
  };

  return CodeOfPractices;
};
