module.exports = {
  async up(db) {
    global.migrationMsg = "learning resource filter form";

    let filtersArray = []
    let forms = [
      {
        name:'All',
        icon:'documents-outline',
        value:[]
      },
      {
        name:'Collections',
        icon:'documents-outline',
        value:[
          "application\/vnd.ekstep.content-collection"
        ]
      },{
        name:'Documents',
        icon:'document-text-outline',
        value:[
          "application\/pdf",
          "application\/epub"
        ]
      },
      {
        name:'video',
        icon:'play-circle-outline',
        value:[
          "video\/mp4",
          "video\/x-youtube",
          "video\/webm"
        ]
      },{
        name:'interactive',
        icon:'play-circle-outline',
        value:[
          "application\/vnd.ekstep.ecml-archive",
          "application\/vnd.ekstep.h5p-archive",
          "application\/vnd.ekstep.html-archive"
        ]
      }

    ];
    
    await db.collection('forms').insertOne({
      name: "learning-resource-filters",
      value: forms
    });

  
    
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
