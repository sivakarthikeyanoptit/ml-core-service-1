module.exports = {
  async up(db) {
    global.migrationMsg = "create user profile form";

    let userProfileForm =
      await db.collection('forms').findOne({ name: "userProfileForm" });
    if (!userProfileForm) {

      let forms = [];
      let inputFields = ["firstName", "lastName", "email", "phoneNumber", "state"];

      await Promise.all(inputFields.map(async function (inputField) {

        let field = inputField.replace( /([A-Z])/g, " $1" );
        let fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);

        let form = {
          label : fieldLabel,
          field : inputField,
          value : "",
          visible : true,
          editable : true,
          validation : {
            required : true,
            regex : "/^[A-Za-z]+$/"
          },
          input : "text"
        };

        switch(inputField) {
          case 'state':
            form.input = "select";
            break;

          case 'email':
            form.validation.regex = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
            break;

          case 'phoneNumber':
            form.input = "text";
            form.validation.regex = "^((\+)?(\d{2}[-]))?(\d{10}){1}?$";
            break;
            
        }

        forms.push(form);
      }));

      let profileForm = {
        name : "userProfileForm",
        value : forms
      }

      await db.collection('forms').insertOne(profileForm);
    }

  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
