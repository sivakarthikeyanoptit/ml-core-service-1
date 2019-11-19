
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
};