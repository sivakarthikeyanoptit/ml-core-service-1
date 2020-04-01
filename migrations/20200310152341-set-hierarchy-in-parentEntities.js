module.exports = {
  async up(db) {
    global.migrationMsg = "Set children hierarchy in all parent entities."


    let entityTypes = await db.collection('entityTypes').find({}).toArray();
    let entityCodeToEntityMap = {}

    entityTypes.forEach(entityType => {
      entityCodeToEntityMap[entityType.name] = {
        entityTypeId: entityType._id,
        entityType: entityType.name,
        immediateChildrenEntityType: (Array.isArray(entityType.immediateChildrenEntityType) &&  entityType.immediateChildrenEntityType.length > 0) ? entityType.immediateChildrenEntityType : false
      }
    });

    let parentEntityTypes = Object.keys(entityCodeToEntityMap);

    for (let pointerToParentEntityTypes = 0; pointerToParentEntityTypes < parentEntityTypes.length; pointerToParentEntityTypes++) {
      const entityType = parentEntityTypes[pointerToParentEntityTypes];

      let allParentEntities = await db.collection('entities').find({entityType : entityType}).project({ groups: 1, entityType : 1 }).toArray();
      for (let pointerToAllParentEntities = 0; pointerToAllParentEntities < allParentEntities.length; pointerToAllParentEntities++) {
        
        const entity = allParentEntities[pointerToAllParentEntities];
        if(entity.groups && Object.keys(entity.groups).length > 0 && entityCodeToEntityMap[entity.entityType].immediateChildrenEntityType) {

          let childHierarchyPath = new Array
          let allPossibleImmediateEntityTypes = entityCodeToEntityMap[entity.entityType].immediateChildrenEntityType
          
          for (let pointerToAllPossibleImmediateEntityTypes = 0; pointerToAllPossibleImmediateEntityTypes < allPossibleImmediateEntityTypes.length; pointerToAllPossibleImmediateEntityTypes++) {
            const immediateEntityType = allPossibleImmediateEntityTypes[pointerToAllPossibleImmediateEntityTypes];
            if(entity.groups[immediateEntityType]) {
              childHierarchyPath.push(immediateEntityType)
              break
            }
          }

          if(childHierarchyPath.length > 0) {
            const drilldown = function (group) {
              if(group == "") return
              let allPossibleImmediateEntityTypes = entityCodeToEntityMap[group].immediateChildrenEntityType
              let immediateEntityTypeSelected = ""
              for (let pointerToAllPossibleImmediateEntityTypes = 0; pointerToAllPossibleImmediateEntityTypes < allPossibleImmediateEntityTypes.length; pointerToAllPossibleImmediateEntityTypes++) {
                const immediateEntityType = allPossibleImmediateEntityTypes[pointerToAllPossibleImmediateEntityTypes];
                if(entity.groups[immediateEntityType]) {
                  childHierarchyPath.push(immediateEntityType)
                  immediateEntityTypeSelected = immediateEntityType
                  break
                }
              }
              drilldown(immediateEntityTypeSelected)
            }
            drilldown(childHierarchyPath[0])
          }

          await db.collection('entities').findOneAndUpdate(
            {
              _id: entity._id
            },
            {
              $set: { "childHierarchyPath": childHierarchyPath }
            }
          )

        }

      }

    }


    return true
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
