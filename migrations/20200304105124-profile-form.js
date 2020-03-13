module.exports = {
  async up(db) {
    global.migrationMsg = "create user profile form"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    let userProfileForm =
      await db.collection('forms').findOne({ name: "userProfileForm" });
    if (!userProfileForm) {

      let allFields = [];
      let inputFields = ["firstName", "lastName", "email", "phoneNumber", "state"];

      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = {};
        inputObj.label = fields;
        inputObj.field = fields;
        inputObj.value = "";
        inputObj.visible = true;
        inputObj.editable = true;

        if (fields != "state" && fields != "email" && fields != "phoneNumber") {

          inputObj.input = "text";
          inputObj['validation'] = {
            required: true,
            regex: "/^[A-Za-z]+$/"

          }

        } else if (fields == "state") {
          inputObj.input = "select";
          inputObj['validation'] = {
            required: true,
            regex: ""
          }
        } else if (fields == "email") {
          inputObj.input = "text";
          inputObj['validation'] = {
            required: true,
            regex: "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
          }
        } if (fields == "phoneNumber") {
          inputObj.input = "text";
          inputObj['validation'] = {
            required: true,
            regex: "^((\+)?(\d{2}[-]))?(\d{10}){1}?$"
          }
        }
        allFields.push(inputObj);
      }));

      let profileForm = {
        name: "userProfileForm",
        value: allFields
      }

      await db.collection('forms').insertOne(profileForm);
    }

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
