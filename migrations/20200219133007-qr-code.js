module.exports = {
  async up(db) {
    global.migrationMsg = "Qr code collection";

    await db.collection('qrCode').createIndex({ 
      code : 1 
    },{ 
      unique : true 
    });

    await db.collection('qrCode').createIndex({ 
      status : 1 
    });

  },

  async down(db) {
  }
};
