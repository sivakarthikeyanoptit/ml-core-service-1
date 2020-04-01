module.exports = {
  async up(db) {
    
    global.migrationMsg = "Version release";
    
    await db.collection('appReleases').createIndex({ 
      appName : 1 
    });

    await db.collection('appReleases').createIndex({ 
      os : 1 
    });

    await db.collection('appReleases').createIndex({ 
      status : 1 
    });

    return;
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
