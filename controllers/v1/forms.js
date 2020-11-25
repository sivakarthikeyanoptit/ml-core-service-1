/**
 * name : forms.js
 * author : Rakesh Kumar
 * created-date : 03-March-2020
 * Description : Forms information. 
 */

 // Dependencies

 const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");
 
  /**
     * Forms
     * @class
 */
 module.exports = class Forms extends Abstract {
   constructor() {
     super(schemas["forms"]);
   }
 
   static get name() {
     return "forms";
   }

       /**
   * @api {post} /kendra/api/v1/forms/list
   * List forms.
   * @apiVersion 0.0.1
   * @apiName List forms.
   * @apiGroup Forms
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "name" : "projects"
    },
    "projection" : ["value"]
    }
   * @apiSampleRequest /kendra/api/v1/forms/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "status": 200,
    "message": "Forms fetched successfully",
    "result": [
    {
        "field" : "title",
        "label" : "Title",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "text",
        "validation" : {
            "required" : true
        }
    },
    {
        "field" : "description",
        "label" : "Description",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "textarea",
        "validation" : {
            "required" : true
        }
    },
    {
        "field" : "categories",
        "label" : "Categories",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "input" : "select",
        "options" : [],
        "validation" : {
            "required" : false
        }
    }
  ]
    }
   */

  /**
   * List forms.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List forms.
  */

 async list(req) {
   return new Promise(async (resolve, reject) => {
     try {
       
        let forms = await formsHelper.list(req.body);
        return resolve(forms);
      
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
  });
}

};
 