module.exports = {
    async up(db) {
      global.migrationMsg = "learning resource filter form";
  
      let filtersArray = []
      let forms = [
        {
          name:'All',
          icon:'',
          value:[]
        },
        {
          name:'Collections',
          icon:'file_copy',
          value:[
            "application\/vnd.ekstep.content-collection"
          ]
        },{
          name:'Documents',
          icon:'insert_drive_file',
          value:[
            "application\/pdf",
            "application\/epub"
          ]
        },
        {
          name:'video',
          icon:'play_circle_outline',
          value:[
            "video\/mp4",
            "video\/x-youtube",
            "video\/webm"
          ]
        },{
          name:'interactive',
          icon:'touch_app',
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
  