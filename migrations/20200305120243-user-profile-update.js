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
            if (err) {

            } else {

              // console.log("data.body", data.body);
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


    let tokenInfo = await generateKeyCloakAccessToken(
      process.env.SUNBIRD_PUBLISHER_USERNAME,
      process.env.SUNBIRD_PUBLISHER_PASSWORD
    );


  

    let userProfiles =
      await db.collection('userProfile').find({}).toArray();


    

    if (userProfiles && userProfiles.length > 0) {
      await Promise.all(userProfiles.map(async function (userInfo) {

        let options = {
          host: process.env.SHIKSHALOKAM_BASE_HOST,
          port: 443,
          path: "/api/user/v1/read/" + userInfo.userId,
          method: "GET",
          headers: {
            authorization: process.env.AUTHORIZATION,
            "x-authenticated-user-token": tokenInfo.token
          }
        };

        let userInfoApiData = await getUserProfileInfo(options);
        console.log("userInfoApiData",userInfo.userId);

        let state = {};
        let cluster = {};
        let block = {};
        let district = {};
        let taluk = {};
        let zone = {};
        let school = {};
        let hub = {};

       
        let userExtensionDoc = await db.collection('userExtension').findOne({ userId: userInfo.userId},{ roles:1 });

        console.log( userInfo.userId,"userExtensionDoc",userExtensionDoc);
        if (userExtensionDoc && userExtensionDoc.roles) {

          await Promise.all(userExtensionDoc.roles.map(async function (rolesInfo) {

            console.log("rolesInfo.entities", rolesInfo.entities[0]);

            let entityDoc = await db.collection('entities').findOne({ _id: rolesInfo.entities[0] },{ entityType: 1, _id: 1 });

            // entityDoc.entityType

            console.log(entityDoc.entityType,"entityDoc",entityDoc._id);
            if (entityDoc) {
              // let groupsOf =  "groups["+entityDoc.entityType+"]: "+entityDoc._id;

              let label = "groups."+entityDoc.entityType
              let query = {}
                query = {
                  entityType: { $ne: entityDoc.entityType },
                }
                query["groups."+entityDoc.entityType] = { $ne :entityDoc._id }
              // console.log(query,"groupsOf");

              let entityDocs = await db.collection('entities').find(query, { entityType: 1, metaInformation: 1 }).toArray();


              if (entityDocs) {
                // console.log("entityDocs",entityDocs)

                await Promise.all(entityDocs.map(async function (entityDocsInfo) {

                  

                  if (entityDocsInfo && entityDocsInfo.entityType && entityDocsInfo.metaInformation) {
                    obj = {
                      name: entityDocsInfo.metaInformation.name,
                      externalId: entityDocsInfo.metaInformation.externalId,
                      _id: entityDocsInfo._id
                    }
                    if (entityDocsInfo.entityType == "state") {
                      state = obj;
                    } else if (entityDocsInfo.entityType == "hub") {
                      hub = obj;
                    } else if (entityDocsInfo.entityType == "taluk") {
                      taluk = obj;
                    } else if (entityDocsInfo.entityType == "district") {
                      district = obj;
                    } else if (entityDocsInfo.entityType == "school") {
                      school = obj;
                    } else if (entityDocsInfo.entityType == "zone") {
                      zone = obj;
                    } else if (entityDocsInfo.entityType == "block") {
                      block = obj;
                    } else if (entityDocsInfo.entityType == "cluster") {
                      cluster = obj;
                    }
                  }
                }));
              }

            }
          }));
        }


        let userIncomingData = userInfo;
        if (userInfoApiData.result && userInfoApiData.result.response) {
          userIncomingData = userInfoApiData.result.response;
        }



        let metaInformation = {
          firstName: userIncomingData.firstName ? userIncomingData.firstName : "",
          lastName: userIncomingData.lastName ? userIncomingData.lastName : "",
          emailId: userIncomingData.email ? userIncomingData.email : "",
          phoneNumber: userIncomingData.phone ? userIncomingData.phone : "",
          state: state,
          district: district,
          block: block,
          zone: zone,
          cluster: cluster,
          taluk: taluk,
          hub: hub,
          school: school,
        }

        let unSetFields = {
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
          school: ""
        }

        let updateInfo = await db.collection('userProfile').findOneAndUpdate({
          _id: userInfo._id
        }, { $set: { metaInformation } }, { upsert: true }, { $unset: { unSetFields } });

        //  await db.collection('userProfile').findOneAndUpdate({
        //     _id: userInfo._id
        //   }, { $unset: { unSetFields } });

      }));

    }

    return true;

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
