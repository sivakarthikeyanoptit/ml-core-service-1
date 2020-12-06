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
        listByEntityIds : function () {
            req.checkBody('entities').exists().withMessage("required Entity ids");
        },
        subEntityTypeList : function () {
            req.checkParams('_id')
            .exists()
            .withMessage("required Entity id")
            .isMongoId()
            .withMessage("Invalid entity id");
        },
        getUsersByEntityAndRole: function () {
            req.checkParams('_id').exists().withMessage("required entity id")
            .isMongoId().withMessage("Invalid entity id");
            req.checkQuery('role').exists().withMessage("required role code");
        }
    }

    if (entityValidator[req.params.method]) {
        entityValidator[req.params.method]()
    }
}