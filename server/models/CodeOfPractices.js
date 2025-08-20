
module.exports = (sequelize, DataTypes) => {
    const CodeOfPractices = sequelize.define("CodeOfPractices", {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        contents: { type: DataTypes.STRING(255), allowNull: true }, // path to PDF
        dateUploaded: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        dateEdited: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    }, { tableName: 'code_of_practices' });
    return CodeOfPractices;
};
