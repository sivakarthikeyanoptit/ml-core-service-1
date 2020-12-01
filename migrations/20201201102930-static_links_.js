var moment = require('moment');
module.exports = {
  async up(db) {
    global.migrationMsg = "Adding static links"

    let staticLinks = [{
      "value": "privacyPolicy",
      "link": "https://shikshalokam.org/wp-content/uploads/2019/01/data_privacy_policy.html",
      "title": "Privacy Policy",
      "appType": "assessment",
      "isCommon": true
    }, {
      "value": "termsOfUse",
      "link": "https://shikshalokam.org/wp-content/uploads/2019/05/Final-ShikshaLokam-Terms-of-Use-MCM-08052019-Clean-copy-1.html",
      "appType": "assessment",
      "title": "Terms of Use",
      "isCommon": true
    }, {
      "value": "tutorial-video",
      "appType": "assessment",
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
      "value": "faq",
      "link": "https://wiki.shikshalokam.org/faqs/",
      "title": "FAQ",
      "appType": "assessment",
      "isCommon": true
    }];

    let staticData = [];
    staticLinks.map(async function(link){
      let staticLink = link;
      staticLink['updatedAt'] =  moment().format();
      staticLink["createdAt"] =  moment().format();
      staticLink["createdBy"] = "SYSTEM";
      staticLink["updatedBy"] = "SYSTEM";
      staticLink["status"] = "active";
      staticLink["isDeleted"] = false;
      staticData.push(staticLink);

      let document = await db.collection('staticLinks').findOne({ value:link.value });
      if(!document){
        await db.collection('staticLinks').insert(staticLink);
      }
      

    })

   

  },
  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
