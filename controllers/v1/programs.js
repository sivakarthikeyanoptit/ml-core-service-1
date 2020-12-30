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
   * @api {post} /kendra/api/v1/programs/create
   * programs create.
   * @apiVersion 0.0.1
   * @apiName programs create.
   * @apiGroup programs
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
      "scope" :{
          "entityType" : "state",
          "entityTypeId" : ObjectId("5d6605db652f3110440de195"),
          "entities" : [ 
              ObjectId("5d6609ef81a57a6173a79e78")
          ]
      }
      
    }
   * @apiSampleRequest /kendra/api/v1/programs/create
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Programs created successfully",
   * "status": 200,
    "result": [
        {
            "_id": "5b98fa069f664f7e1ae7498c"
        }
      ]
    }
   */

  /**
   * Create programs.
   * @method
   * @name create
   * @param {Object} req - Requested data.
   * @returns {JSON} create programs data.
  */

 async create(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const programs = await programsHelper.create(
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
   * @api {post} /kendra/api/v1/programs/update/:programId
   * programs update.
   * @apiVersion 0.0.1
   * @apiName programs update.
   * @apiGroup programs
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
      "imageCompression" : {
          "quality" : 10
      },
      "components" : [ 
          ObjectId("5b98fa069f664f7e1ae7498c")
      ],
      "scope" :{
          "entityType" : "state",
          "entityTypeId" : ObjectId("5d6605db652f3110440de195"),
          "entities" : [ 
              ObjectId("5d6609ef81a57a6173a79e78")
          ]
      }
    }
   * @apiSampleRequest /kendra/api/v1/programs/update/5b98d7b6d4f87f317ff615ee
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response: 
   * {
   * "message": "Programs updated successfully",
   * "status": 200,
    "result": [
        {
            "_id": "5b98fa069f664f7e1ae7498c"
        }
      ]
    }
   */

  /**
   * Update programs.
   * @method
   * @name update
   * @param {Object} req - Requested data.
   * @param {String} req.params._id - programId
   * @returns {JSON} updated programs id.
  */

 async update(req) {
    return new Promise(async (resolve, reject) => {
      try {
  
        const programs = await programsHelper.update(
            req.params._id,
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

}