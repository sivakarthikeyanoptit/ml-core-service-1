module.exports = {
    name: "apps",
    schema: {
      name : {
          type: String,
          required: true,
          index: true,
          unique: true
      },
      displayName: {
          type: String,
          required: true
      },
      description : {
          type: String,
          required: true
      },
      logo: {
          type: String,
          required: true
      },
      playstoreLink: {
          type: String,
          required: true
      },
      appStoreLink: {
          type: String
      },
      createdBy: {
        type: String,
        required: true
      },
      updatedBy: {
        type: String,
        required: true
      },
      status: {
        type: String,
        required: true
      },
      isDeleted: {
          type: Boolean,
          default: false
      }
    }
  };