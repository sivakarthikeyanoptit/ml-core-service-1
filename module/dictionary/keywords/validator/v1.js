module.exports = (req) => {

    let keywordsValidator = {
        
        update: function () {
            req.checkBody('keywords').isLength({ min: 1 }).withMessage("required keywords");
        }
    }

    if (keywordsValidator[req.params.method]) {
        keywordsValidator[req.params.method]();
    }

};