const Users = require("../models/users");
const AccessToken = require("../models/accessToken");
const bcrypt = require("bcrypt");
const CryptoPass = require('../lib/password');
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_PRIVATE_KEY;
const userEmail = process.env.USER_NAME;
const userPassword = process.env.USER_PASSWORD;

class AuthController {
  async login(body) {
    try {
      const user = body.email === userEmail && body.password === userPassword;
      
      if (!user) {
        return { statusCode: 400, message: "User not found" };
      }      

      let payload = {
        email: body.email,
        date: new Date()
      };
  
      let token = jwt.sign({ payload }, secret);

      return { access_token: token };    
    } catch (error) {
      return { statusCode: 400, message: `Login failed: ${error}` }
    }
  }

  async register({ email, password }) {
    try {
      if (await Users.findOne({ email })) {
        return { statusCode: 400, message: 'User already exists' }
      }

      let pass = CryptoPass.saltHashPassword(password);
      let userPassword = { 
        encryptedPassword: pass.passwordHash, 
        passwordSalt: pass.salt
      };


      const user = await Users.create({ email, password: userPassword.encryptedPassword, salt: userPassword.passwordSalt });

      user.password = undefined;

      return user
    } catch (err) {
      return { statusCode: 400, message: `Registration failed: ${err}` }
    }
  };

  async getFromJWT (jwt) {
    return await AccessToken.findOne({ where: { userId: jwt.payload.userId, id: jwt.payload.accessTokenId } });
  }

}

module.exports = AuthController;