module.exports = {
  async up(db) {
    global.migrationMsg = "using forms collection it create record"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    console.log("=======");

    let userProfileForm = 
    await db.collection('forms').findOne({ name:"userProfileForm" });
    console.log("userProfileForm",userProfileForm);
   

    if(!userProfileForm){
     

     let inputFields =  [ {
        field:"firstName",
        label:"firstName",
        value:"",
        visible:"",
        editable:true,
        validation: { required:true },
        input:"text"
      },{
        field:"lastName",
        label:"lastName",
        value:"",
        visible:"",
        editable:true,
        validation: { required:true },
        input:"text"
      },{
        field:"emailId",
        label:"emailId",
        value:"",
        visible:"",
        editable:true,
        validation: { required:true },
        input:"text"
      },{
        field:"phoneNumber",
        label:"phoneNumber",
        value:"",
        visible:"",
        editable:true,
        validation: { required:true },
        input:"text"
      },{
        field:"state",
        label:"state",
        value:"",
        visible:"",
        editable:true,
        validation: { required:true },
        input:"dropdown",
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
