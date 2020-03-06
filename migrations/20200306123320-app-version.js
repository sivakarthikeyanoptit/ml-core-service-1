module.exports = {
  async up(db) {
    
    global.migrationMsg = "App version update migration"
    
    await db.collection('appVersion').createIndex({ 
      status : 1 
    });

    await db.collection('appVersion').createIndex({ 
      appName : 1 
    });

    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
