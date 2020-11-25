module.exports = (req) => {
    let entityValidator = {
        listByEntityType : function () {
            req.checkParams('_id').exists().withMessage("required Entity type");
        },
        immediateEntities : function () {
            req.checkParams('_id').exists().withMessage("required Entity id");
        },
        details : function () {
            req.checkParams('_id').exists().withMessage("required Entity id");
        },
        subEntitiesRoles : function() {
            req.checkParams('_id').exists().withMessage("required Entity id");
        },
        getUsersByEntityAndRole: function () {
            req.checkBody('entityId').exists().withMessage("entityId id is required");
            req.checkBody('role').exists().withMessage("role is required");
        }
    }

    if (entityValidator[req.params.method]) {
        entityValidator[req.params.method]()
    }
}