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
        regex:"/^[A-Za-z]+$/",
        validation: { required:true },
        input:"text"
      },{
        field:"lastName",
        label:"lastName",
        value:"",
        visible:true,
        editable:true,
        regex:"/^[A-Za-z]+$/",
        validation: { required:true },
        input:"text"
      },{
        field:"emailId",
        label:"emailId",
        value:"",
        visible:true,
        editable:true,
        regex:"^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$",
        validation: { required:true },
        input:"text"
      },{
        field:"phoneNumber",
        label:"phoneNumber",
        value:"",
        visible:true,
        editable:true,
        regex:"^((\+)?(\d{2}[-]))?(\d{10}){1}?$",
        validation: { required:true },
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
