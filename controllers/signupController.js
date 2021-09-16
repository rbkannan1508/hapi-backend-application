const config = require("config");
const accountmodel = require("../models/Account");
const usermodel = require("../models/User");
const rolemodel = require("../models/Role");
const sequelize = require('../config/database');
const JWTToken = require('../helpers/JWTToken');
const redisCache = require('../helpers/redisCache');
const bcrypt = require ('bcrypt');
const saltRounds = 10;
const cookie_options = require('../config/constants')

module.exports.signupSubmit = async function (request, reply) {
  const userData = {};
  console.log('request.payload', request.payload);
  userData.username = request.payload.username;
  userData.phone = request.payload.phone;
  userData.email = request.payload.email;
  userData.password = request.payload.password;
  userData.account = request.payload.account;
  let accountId, roleId, token;
  
  await sequelize.transaction({}, async (t) => {
    try {
      /* Insert into Account Details */
      await accountmodel.create({ accountName: userData.account }, { transaction: t });
      console.log("Successfully inserted Account Details");

      /* Find from Account Details */
      const dataf = await accountmodel.findAll({ attributes: ["id"], where: { accountName: userData.account }, transaction: t });
      accountId = dataf[0].id;
      console.log("Successfully fetched Account Id", accountId);

      /* Bulk insert into Role Details */
      await rolemodel.bulkCreate([
        { roleName: config.get('roles.accountOwner'), accountId: accountId },
        { roleName: config.get('roles.admin'), accountId: accountId },
        { roleName: config.get('roles.user'), accountId: accountId }
        ], { transaction: t });
      console.log("Successfully inserted Role Details");

      /* Find from role Details */
      const response = await rolemodel.findOne({ attributes: ["id"], where: { accountId: accountId, roleName: 'Account Owner' }, transaction: t });
      roleId = response.id;
      console.log('Successfully fetched roleId', roleId);

      /** Hashing Password */
      const hash = await bcrypt.hash(request.payload.password, saltRounds);
      userData.password = hash;

      /* Insert into User Details */
      await usermodel.create({ userName: userData.username, phone: userData.phone, email: userData.email, password: userData.password, 
        accountId: accountId, roleId: roleId }, { transaction: t });
      console.log("Successfully inserted User Details");

      /* Find from user Details */
      const resp = await usermodel.findOne({ attributes: ['id'], where: {email: userData.email}, transaction: t });
      userId = resp.id;
      console.log('Successfully fetched userId', userId);

      /** Creating JWT Token */
      token = await JWTToken.createToken(userData.email);
      const userDetails = {
        email: userData.email,
        accountId: accountId,
        userId: userId,
      }
      const key = 'userDetails_' + userData.email;
      const ttl = 3600;
      redisCache.setDataToCache(key, ttl, JSON.stringify(userDetails));

      /** Replying to front-end */
      const data = {
        message: 'User Addition Successful',
        accountId: accountId,
        userId: userId,
        email: userData.email,
        username: userData.username
      };

      reply(data).state("token", token, cookie_options).code(200);
    } catch (e) {
      console.log('Error in account creation', e);
      const data = {
          message: 'Error in account creation'
      }
      reply(data + e).code(500);
    }
  });
}

module.exports.signup = async function (request, reply) {
  await reply.file('./views/html/signup.html');    
}
