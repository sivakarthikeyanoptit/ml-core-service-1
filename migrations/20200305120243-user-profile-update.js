module.exports = {
  async up(db) {
    global.migrationMsg = "update userProfile information"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    let userProfiles =
    await db.collection('userProfile').find({  }).toArray();
    if (userProfiles && userProfiles.length > 0) {
      await Promise.all(userProfiles.map(async function (userInfo) {
       
         let metaInformation = {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            emailId: userInfo.emailId,
            phoneNumber: userInfo.phoneNumber,
            state: userInfo.state,
            district: userInfo.district,
            block: userInfo.block,
            zone: userInfo.zone,
            cluster: userInfo.cluster,
            taluk: userInfo.taluk,
            hub: userInfo.hub,
            school: userInfo.school,
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
        },{  $set :{ metaInformation }  },{ upsert: true } ,{ $unset: { unSetFields } } );

      }));

    }

    return true;

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
