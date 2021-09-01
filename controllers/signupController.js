let ejs = require("ejs");
const config = require("config");
const accountmodel = require("../models/Accountdetails");
const usermodel = require("../models/Userdetails");
const showMessageFile = "./views/html/showMessage.html";

module.exports.signupSubmit = function (request, reply) {
  let userData = {};
  if (request) {
    userData.username = request.payload.username;
    userData.phone = request.payload.phone;
    userData.email = request.payload.email;
    userData.password = request.payload.password;
    userData.account = request.payload.account;
    userData.role_id = config.get("roles.account_owner_id");
    console.log(userData, "userData");

    accountmodel
      .create({
        accountName: userData.account,
      })
      .then((response) => {
        console.log("Successfully inserted Account Details");
        accountmodel
          .findAll({
            attributes: ["accountId"],
            where: { accountName: userData.account },
          })
          .then((response) => {
            let resp = response[0].dataValues.accountId;
            usermodel
              .create({
                userName: userData.username,
                phone: userData.phone,
                email: userData.email,
                password: userData.password,
                accountId: resp,
                roleId: userData.role_id,
              })
              .then((response) => {
                console.log("Successfully inserted User Details");
                userData = {};
                let message = "Data Success";
                return reply.view(showMessageFile, { message: message });
              })
              .catch((err) => {
                console.log("Error in inserting data of User Details", err);
                let message = `Error in inserting data of User Details`;
                return reply.view(showMessageFile, { message: message });
              });
          })
          .catch((err) => {
            console.log("Error in fetching data of User Details", err);
            let message = `Error in fetching data of User Details`;
            return reply.view(showMessageFile, { message: message });
          });
      })
      .catch((err) => {
        console.log("Error in insertion of Account Details", err);
        let message = `Account ${userData.account} already exists`;
        return reply.view(showMessageFile, { message: message });
      });
  }
};

module.exports.signup = function (request, reply) {
  reply.file('./views/html/signup.html');    
}
