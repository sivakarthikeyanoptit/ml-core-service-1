module.exports = (req, res, next) => {
    if ((req.method == "GET" || req.method == "POST") && !req.path.includes("/language/")) {

        if (req.headers && req.headers["translation-language"]) {
            req.translationLanguage = req.headers["translation-language"];
        } else {
            req.translationLanguage = "english"
        }
    }

    next();
    return;
}


