/**
 * name : programs.js
 * author : Aman
 * created-date : 03-Sep-2020
 * Description : Solution related information.
 */

// Dependencies
const programsHelper = require(MODULES_BASE_PATH + "/programs/helper");

module.exports = class Programs extends Abstract {
    
    constructor() {
        super(schemas["programs"]);
    }

    /**
   * @api {post} /kendra/api/v1/programs/list
   * programs lists.
   * @apiVersion 0.0.1
   * @apiName programs lists.
   * @apiGroup programs
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiParamExample {json} Request-Body:
   * {
    "query" : {
        "externalId" : "PROGID01"
    },
    "projection" : ["_id","name"]
    }
   * @apiSampleRequest /kendra/api/v1/programs/list
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Programs fetched successfully",
   * "status": 200,
    "result": [
        {
            "_id": "5b98fa069f664f7e1ae7498c",
            "name": "DCPCR Assessment Framework 2018"
        }
      ]
    }
   */

  /**
   * List programs.
   * @method
   * @name list
   * @param {Object} req - Requested data.
   * @param {Object} req.body.query - Filtered data.
   * @param {Array} req.body.projection - Projected data.
   * @param {Array} req.body.skipFields - Field to skip.
   * @returns {JSON} List programs data.
  */

 async list(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const programs = await programsHelper.list(
            req.body
        );
  
        return resolve(programs);
  
      } catch (error) {
        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        });
      }
    });
  }

    /**
  * @api {post} /kendra/api/v1/programs/create Create Program
  * @apiVersion 1.0.0
  * @apiName create
  * @apiGroup programs
  * @apiSampleRequest /kendra/api/v1/programs/create
  * @apiHeader {String} internal-access-token internal access token  
  * @apiHeader {String} X-authenticated-user-token Authenticity token 
  * @apiParamExample {json} Request-Body:
  * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "createdFor" : [ 
          "0126427034137395203", 
          "0124487522476933120"
      ],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          ObjectId("5b98fa069f664f7e1ae7498c")
      ],
      "scope" : {
          "entityType" : "state",
          "entities" : [ 
              ObjectId("5d6609ef81a57a6173a79e78")
          ],
          "roles" : [
              {
                "_id" : "5d6e521066a9a45df3aa891e",
                "code" : "HM"
              }
          ]
      }
    }
  * @apiParamExample {json} Response:
   {
    "message": "Program created successfully",
    "status": 200,
    "result": {
        "_id": "5ff09aa4a43c952a32279234"
    }
   } 
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Create program.
   * @method
   * @name create
   * @param {Object} req - requested data.
   * @returns {JSON} - created program document.
   */

  async create(req) {
    return new Promise(async (resolve, reject) => {
      try {

        req.body.userId = req.userDetails.userId;
        let programCreationData = await programsHelper.create(
          req.body
        );
        
        return resolve({
          message : constants.apiResponses.PROGRAMS_CREATED,
          result : _.pick(programCreationData,["_id"])
        });

      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

  /**
  * @api {post} /kendra/api/v1/programs/update/:programId Update Program
  * @apiVersion 1.0.0
  * @apiName Update
  * @apiGroup programs
  * @apiSampleRequest /kendra/api/v1/programs/update/5ff09aa4a43c952a32279234
  * @apiHeader {String} X-authenticated-user-token Authenticity token 
  * @apiParamExample {json} Request-Body:
  * {
      "externalId" : "PROGID01",
      "name" : "DCPCR School Development Index 2018-19",
      "description" : "DCPCR School Development Index 2018-19",
      "isDeleted" : false,
      "resourceType" : [ 
          "program"
      ],
      "language" : [ 
          "English"
      ],
      "keywords" : [],
      "concepts" : [],
      "createdFor" : [ 
          "0126427034137395203", 
          "0124487522476933120"
      ],
      "userId":"a082787f-8f8f-42f2-a706-35457ca6f1fd",
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          ObjectId("5b98fa069f664f7e1ae7498c")
      ],
      "scope" : {
          "entityType" : "state",
          "entities" : [ 
              ObjectId("5d6609ef81a57a6173a79e78")
          ],
          "roles" : [
              {
                "_id" : "5d6e521066a9a45df3aa891e",
                "code" : "HM"
              }
          ]
      }
    }
  * @apiParamExample {json} Response:
  {
    "message": "Program updated successfully",
    "status": 200,
    "result": {
        "_id": "5ff09aa4a43c952a32279234"
    }
   } 
  * @apiUse successBody
  * @apiUse errorBody
  */

   /**
   * Update program.
   * @method
   * @name update
   * @param {Object} req - requested data.
   * @param {Object} 
   * @returns {JSON} - 
   */

  async update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let programUpdationData = await programsHelper.update(
          req.params._id,
          req.body,
          req.userDetails.userId
        );
        
        programUpdationData.result = programUpdationData.data;
        return resolve(programUpdationData);

      }
      catch (error) {
        reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }  

}