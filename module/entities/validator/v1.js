module.exports = (req) => {
    let entityValidator = {
        listByEntityType : function () {
            req.checkParams('_id').exists().withMessage("required Entity type")
        },
        immediateEntities : function () {
            req.checkParams('_id').exists().withMessage("required Entity id")
        }
    }

    if (entityValidator[req.params.method]) {
        entityValidator[req.params.method]()
    }
}