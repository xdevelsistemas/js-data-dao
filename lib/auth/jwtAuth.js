"use strict";
exports.authenticate = (passport, appConfig) => {
    return passport.authenticate(appConfig.getJwtConfig().strategy, appConfig.getJwtConfig().session);
};

//# sourceMappingURL=jwtAuth.js.map
