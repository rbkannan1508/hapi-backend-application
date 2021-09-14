const config = require("config");
const accountmodel = require("../models/Account");
const usermodel = require("../models/User");
const rolemodel = require("../models/Role");
const sequelize = require('../config/database');
const { createToken } = require('../helpers/JWTToken');
const redisCache = require('../helpers/redisCache');

module.exports.signupSubmit = async function (request, reply) {
  let userData = {};
  if (request) {
    console.log('request.payload', request.payload);
    userData.username = request.payload.username;
    userData.phone = request.payload.phone;
    userData.email = request.payload.email;
    userData.password = request.payload.password;
    userData.account = request.payload.account;
    let data = [];
    let accountId, roleId;
    await sequelize.transaction({}, async (t) => {
      /* Insert into Account Details */
      try {
        await accountmodel.create({ accountName: userData.account }, { transaction: t });
        console.log("Successfully inserted Account Details");
      } catch (e) {
        console.error(e, 'Account creation failed');
        await t.rollback();
      }
      /* Find from Account Details */
      try {
        data = await accountmodel.findAll({ attributes: ["id"], where: { accountName: userData.account }, transaction: t });
        accountId = data[0].dataValues.id;
        console.log("Successfully fetched Account Id", accountId);
      } catch (e) {
        console.error(e, 'Fetching data failed while getting account id');
        await t.rollback();
      }
      /* Bulk insert into Role Details */
      try {
        await rolemodel.bulkCreate([
          { roleName: config.get('roles.accountOwner'), accountId: accountId },
          { roleName: config.get('roles.admin'), accountId: accountId },
          { roleName: config.get('roles.user'), accountId: accountId }
          ], { transaction: t });
        console.log("Successfully inserted Role Details");
      } catch (e) {
        console.error(e, 'Insert Role Details failed');
        await t.rollback();
      }
      /* Find from role Details */
      try {
        let response = await rolemodel.findOne({ attributes: ["id"], where: { accountId: accountId, roleName: 'Account Owner' }, transaction: t });
        roleId = response.dataValues.id;
        console.log('Successfully fetched roleId', roleId);
      } catch (e) {
        console.error(e, 'Role Id fetch failed');
        await t.rollback();
      }
      /* Insert into User Details */
      try {
        await usermodel.create({ userName: userData.username, phone: userData.phone, email: userData.email, password: userData.password, 
            accountId: accountId, roleId: roleId }, { transaction: t });
        console.log("Successfully inserted User Details");
      } catch (e) {
        console.error(e, 'Insert User Details failed');
        await t.rollback();
      }
      /* Find from user Details */
      try {
        let response = await usermodel.findOne({ attributes: ['id'], where: {email: userData.email}, transaction: t });
        userId = response.dataValues.id;
        console.log('Successfully fetched userId', userId);
      } catch (e) {
        console.error(e, 'User Id fetch failed');
        await t.rollback();
      }
    }).then(() => {
      let token = createToken(userData.email);
      const cookie_options = {
          ttl: 1 * 24 * 60 * 60 * 1000, // expires after a day
          encoding: 'none',
          isSameSite: false,
          isSecure: true,
          isHttpOnly: false,
          clearInvalid: false,
          strictHeader: true,
          path: '/'
      }
      redisCache.setDataToCache('email', 3600, userData.email);
      redisCache.setDataToCache('accountId', 3600, accountId);
      redisCache.setDataToCache('userId', 3600, userId);
      let data = {
          message: 'User Addition Successful',
          accountId: accountId,
          userId: userId,
          email: userData.email,
          username: userData.username
      };
      console.log('token****', token);
      console.log('cookie_options***', cookie_options);
      reply(data).header("Authorization", token).state("token", token, cookie_options);
      }).catch(err => {
          let data = {
            message: 'Signup Failure'
          }
          reply(data + err);
      });
  }
}

module.exports.signup = async function (request, reply) {
  await reply.file('./views/html/signup.html');    
}
