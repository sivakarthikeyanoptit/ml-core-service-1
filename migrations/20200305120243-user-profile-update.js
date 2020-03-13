var http = require("https");
const jwtDecode = require('jwt-decode');
const request = require("request");

module.exports = {
  async up(db) {
    global.migrationMsg = "update userProfile information"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

   


    var generateKeyCloakAccessToken = function (userName, password) {

      let keyCloakUrl =
        process.env.sunbird_keycloak_auth_server_url + "/realms/" +
        process.env.sunbird_keycloak_realm + "/protocol/openid-connect/token";

      return new Promise(async (resolve, reject) => {
        try {

          let options = {
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
            },
            form: {
              client_id: process.env.sunbird_admin_cli,
              username: userName,
              password: password,
              grant_type: process.env.sunbird_grant_type
            }
          }

          request.post(keyCloakUrl, options, callback);

          function callback(err, data) {
            if (!err) {
              let body = JSON.parse(data.body);
              return resolve({
                token: body.access_token
              })
            }
          }

        } catch (err) {
          return reject(err);
        }
      })
    };


    var getUserProfileInfo = function (options) {
      return new Promise(async (resolve, reject) => {
        try {

          let body = "";
          var httpreq = http.request(options, function (response) {
            response.setEncoding("utf8");
            response.on("data", function (chunk) {
              body += chunk;
            });
            response.on("end", function () {
              if (
                response.headers["content-type"] ==
                "application/json; charset=utf-8" ||
                response.headers["content-type"] == "application/json"
              ) {
                body = JSON.parse(body);
                return resolve(body);
              }
            });
          });
          httpreq.end();

        } catch (err) {
        }
      });

    }

    var getEntityInfo = function(entityId){
      return new Promise(async function(resolve,reject){
        let entityInfo =  await db.collection('entities').findOne({ _id:entityId },{ metaInformation:1 });

        let entity = {};

        if(entityInfo){
          entity = {
            label:entityInfo.metaInformation.name,
            value:entityInfo._id,
            externalId:entityInfo.metaInformation.externalId
          }
        }
        resolve(entity);
       
      });
    }

    let tokenInfo = await generateKeyCloakAccessToken(
      process.env.SUNBIRD_PUBLISHER_USERNAME,
      process.env.SUNBIRD_PUBLISHER_PASSWORD
    );
    let userProfiles =
      await db.collection('userProfile').find({}).toArray();
    if (userProfiles && userProfiles.length > 0) {
      await Promise.all(userProfiles.map(async function (userInfo) {

        let options = {
          host: process.env.sunbird_uri,
          port: 443,
          path: "/api/user/v1/read/" + userInfo.userId,
          method: "GET",
          headers: {
            authorization: process.env.AUTHORIZATION,
            "x-authenticated-user-token": tokenInfo.token
          }
        };

        let userInfoApiData = await getUserProfileInfo(options);
        let entitiesList = ["state","cluster","block","district","taluk","zone","hub","school"];
        let userIncomingData = userInfo;
        let profileAPiData = {};
        if (userInfoApiData.result && userInfoApiData.result.response) {
          profileAPiData = userInfoApiData.result.response;
        }

        let metaInformation = {
          firstName: userIncomingData.firstName ? userIncomingData.firstName : profileAPiData.firstName,
          lastName: userIncomingData.lastName ? userIncomingData.lastName : profileAPiData.lastName,
          emailId: userIncomingData.email ? userIncomingData.email : profileAPiData.email,
          phoneNumber: userIncomingData.phoneNumber ? userIncomingData.phoneNumber : profileAPiData.phone,
        }

        if(userInfo.state){
          await Promise.all(entitiesList.map(async function(entities){
            let entitiesInfo = await getEntityInfo(userInfo[entities]);
            if(entitiesInfo && entitiesInfo.label){
              if(entities=="state"){
                metaInformation[entities]= entitiesInfo;
              }else{
                metaInformation[entities] = [];
                metaInformation[entities].push(entitiesInfo);
              }
            }
          }));
        }

        let updateInfo = await db.collection('userProfile').findOneAndUpdate({
          _id: userInfo._id
        }, { $set: { status:"notVerified",metaInformation } }, { upsert: true });

        let updateInfoOnset = await db.collection('userProfile').findOneAndUpdate({
          _id: userInfo._id
        }, { $unset: {
          firstName: "",
          lastName: "",
          emailId: "",
          phoneNumber: "",
          state: "",
          district: "",
          block: "",
          zone: "",
          cluster: "",
          hub: "",
          school: "",
          taluk:"",
          sentPushNotifications:""
        } });
 
      }));
    }
    return true;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
