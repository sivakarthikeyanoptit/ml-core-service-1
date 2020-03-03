module.exports = {
  async up(db) {
    global.migrationMsg = "Qr code collection";

    await db.collection('qrCodes').createIndex({ 
      code : 1 
    },{ 
      unique : true 
    });

    await db.collection('qrCodes').createIndex({ 
      status : 1 
    });

  },

  async down(db) {
  }
};
