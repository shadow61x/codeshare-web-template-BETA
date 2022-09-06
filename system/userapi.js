//Mongodb models
const dbuser = require("../models/user");


async function admincontrol(data) {
    let getuser = await dbuser.findOne({userıd:data});
    return getuser.admin;
  }

  async function sharercontrol(data) {
    let getuser = await dbuser.findOne({userıd:data});
    return getuser.sharer;
  }

  async function vipcontrol(data) {
    let getuser = await dbuser.findOne({userıd:data});
    return getuser.vip;
  }



  module.exports = {
    admincontrol,
    sharercontrol,
    vipcontrol
}