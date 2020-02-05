module.exports = {
  async up(db) {

    global.migrationMsg = "Migrated up add-appType-to-devices file";
    
    let userExtensionDocuments = await db.collection('userExtension').find({devices :{$exists : true}}).project({devices: 1}).toArray();

    if(userExtensionDocuments.length >0) {

      global.migrationMsg = "Add appType assessment to all existing device ids of users."

      for (let pointerToUserExtensionArray = 0; pointerToUserExtensionArray < userExtensionDocuments.length; pointerToUserExtensionArray++) {
        const user = userExtensionDocuments[pointerToUserExtensionArray];
        let updateUserDocument = false;
        if(user.devices.length > 0) {
          for (let pointerToUserDevices = 0; pointerToUserDevices < user.devices.length; pointerToUserDevices++) {
            const device = user.devices[pointerToUserDevices];
            if(!device.appType || device.appType == "") {
              device.appType = "assessment";
              updateUserDocument = true;
            }
          }
          if(updateUserDocument) {
            await db.collection('userExtension').findOneAndUpdate({
              _id: user._id
            }, { $set: {devices: user.devices}})
          }
        }
      }
      
    }

    return true
},

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
