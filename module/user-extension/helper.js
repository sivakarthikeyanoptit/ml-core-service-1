
module.exports = class userExtensionHelper {

    static profileWithEntityDetails(filterQueryObject) {
        return new Promise(async (resolve, reject) => {
            try {

                let userExtensionData = await database.models.userExtension.findOne(filterQueryObject)

                return resolve(userExtensionData)
                
            } catch (error) {
                return reject(error);
            }
        })


    }

    static createOrUpdate(deviceData, userDetails) {

        return new Promise(async (resolve, reject) => {
            try {   
                
                let deviceArray = [];  
                let userId = userDetails.userId;         
                 
                let userExtensionData = await database.models.userExtension.findOne({
                    userId: userId,
                    status: "active",
                    isDeleted: false
                })

                if (userExtensionData) {

                    deviceArray = userExtensionData.devices;

                    if (deviceArray.some(e => e.deviceId === deviceData.deviceId)) {
                        
                    } else {

                        deviceArray.push(deviceData);

                        let deviceUpdate = await database.models.userExtension.findOneAndUpdate(
                            {
                                userId: userId
                            },
                            _.merge({
                                "devices": deviceArray
                            })
                        );
                    }

                    return resolve({
                        success : true,
                        message : "Device successfuly registered."
                    });

                }

                else {
                    
                    deviceArray.push(deviceData);

                    let newUser = await database.models.userExtension.create(
                        {
                            "userId": userId,
                            "externalId": userDetails.email,
                            "devices": deviceArray,
                            "createdBy": "SYSTEM",
                            "updatedBy": "SYSTEM"
                        }
                    );

                    return resolve({
                        success : true,
                        message : "Device successfuly registered."
                    });

                }
                
            } catch (error) {
                return reject(error);
            }
        })


    }
};