global.nodeScheduler = require("node-schedule");

require("./pending-assessments")();
require("./pending-observations")();
require("./completed-assessments")();
require("./completed-observations")();
require("./delete-read-notifications/samiksha")();
require("./delete-read-notifications/unnati")();
// require("./delete-unread-notifications/samiksha")(); <- Dirty Fix Not required for current use case ->
// require("./delete-unread-notifications/unnati")();<- Dirty Fix Not required for current use case ->





