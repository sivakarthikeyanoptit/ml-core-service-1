module.exports = {
  async up(db) {
    global.migrationMsg = "using forms collection it create record"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    let userProfileForm = 
    await db.collection('forms').findOne({ name:"userProfileForm" });
    if(!userProfileForm){

     let inputFields =  [ {
        field:"firstName",
        label:"firstName",
        value:"",
        visible:true,
        editable:true,
        validation: { required:true,
          regex:"/^[A-Za-z]+$/" },
        input:"text"
      },{
        field:"lastName",
        label:"lastName",
        value:"",
        visible:true,
        editable:true,
        validation: { required:true,
          regex:"/^[A-Za-z]+$/" },
        input:"text"
      },{
        field:"email",
        label:"email",
        value:"",
        visible:true,
        editable:true,
        validation: { required:true,
          regex:"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
         },
        input:"text"
      },{
        field:"phoneNumber",
        label:"phoneNumber",
        value:"",
        visible:true,
        editable:true,
        validation: { required:true,
          regex:"^((\+)?(\d{2}[-]))?(\d{10}){1}?$"
         },
        input:"text"
      },{
        field:"state",
        label:"state",
        value:"",
        visible:true,
        editable:true,
        validation: { required:true },
        input:"select",
        options:[{
          
        }]
      }]
      let userProfileForm = {
        name:"userProfileForm",
        value:inputFields
      }

      await db.collection('forms').insertOne(userProfileForm);
    }

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
