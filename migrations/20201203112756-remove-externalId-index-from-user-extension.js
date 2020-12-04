module.exports = {
  async up(db) {
    global.migrationMsg = "Remove external id index from user extension";
    await db.collection('userExtension').dropIndex({ externalId : 1 });
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
