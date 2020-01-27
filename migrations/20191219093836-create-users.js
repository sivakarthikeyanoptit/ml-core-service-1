module.exports = {
  async up(db) {
    global.migrationMsg = "User collection created Successfully";

    await db.collection('users').createIndex( { email: 1}, { unique: true } );

    let user1 = {
      userName: "Sriram",
      email: "sriram@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }

    let user2 = {
      userName: "Ashwini",
      email: "ashwini@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }

    let user3 = {
      userName: "Ajay",
      email: "ajay@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }

    let user4 = {
      userName: "Bachi",
      email: "bachi@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }

    let user5 = {
      userName: "Shikshalokam_Support",
      email: "support@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }

    let user6 = {
      userName: "Shikshalokam_Social",
      email: "social@shikshalokam.org",
      role: "SYS_ADMIN",
      createdAt: new Date,
      updatedAt: new Date,
      createdBy: "SYSTEM",
    }


    return await db.collection('users').insertMany([
      user1,
      user2,
      user3,
      user4,
      user5,
      user6
    ]);
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
