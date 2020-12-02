var moment = require('moment');
module.exports = {
  async up(db) {
    global.migrationMsg = "Adding static links"

    let staticLinks = [{
      "value": "privacy-policy",
      "link": "https://shikshalokam.org/wp-content/uploads/2019/01/data_privacy_policy.html",
      "title": "Privacy Policy",
      "isCommon": true
    }, {
      "value": "terms-of-use",
      "link": "https://shikshalokam.org/wp-content/uploads/2019/05/Final-ShikshaLokam-Terms-of-Use-MCM-08052019-Clean-copy-1.html",
      "title": "Terms of Use",
      "isCommon": true
    }, {
      "value": "tutorial-videos",
      "link": "",
      "title": "Tutorial Video",
      "metaInformation": {
        "videos": [
          {
            "value": "video1",
            "title": "How to create observations and see reports?",
            "link": "https://youtu.be/ovqDe_G7ct8"
          }
        ]
      },
      "isCommon": true
    }, {
      "value": "faqs",
      "link": "https://wiki.shikshalokam.org/faqs/",
      "title": "FAQ",
      "isCommon": true
    }];

    let staticData = [];
    staticLinks.map(async function(link){
      let staticLink = link;
      staticLink["appType"] = "improvement-project";
      staticLink["appName"] = "unnati";
      staticLink['updatedAt'] =  moment().format();
      staticLink["createdAt"] =  moment().format();
      staticLink["createdBy"] = "SYSTEM";
      staticLink["updatedBy"] = "SYSTEM";
      staticLink["status"] = "active";
      staticLink["isDeleted"] = false;
      staticData.push(staticLink);
     
    })
    await db.collection('staticLinks').insertMany(staticData);

   

  },
  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
