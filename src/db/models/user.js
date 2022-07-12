"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/auth");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Book, { foreignKey: "BookId" });
    }
    static #encrypt = (password) => bcrypt.hashSync(password, 10);
    checkPassword = (password) => bcrypt.compareSync(password, this.password);
    generateToken = () => {
      const payload = {
        id: this.id,
        username: this.username,
      };
      const token = jwt.sign(payload, config.secret);
      return token;
    };

    static register = ({ username, email, password, role }) => {
      const encryptedPassword = this.#encrypt(password);
      return this.create({
        username,
        email,
        password: encryptedPassword,
        role,
      });
    };

    static authenticate = async ({ username, password }) => {
      try {
        const user = await this.findOne({ where: { username } });
        if (!user) return Promise.reject("Failed! User Not found.");
        const isPasswordValid = user.checkPassword(password);
        if (!isPasswordValid) return Promise.reject("Failed! Wrong Password");
        return Promise.resolve(user);
      } catch (err) {
        return Promise.reject(err);
      }
    };

    static updateUser = ({ username, email, password, role }) => {
      // const isPasswordValid = user.checkPassword(password);
    };
  }
  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      BookId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
