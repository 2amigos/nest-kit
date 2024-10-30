var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
module.exports = require('babel-loader').custom(() => {
    return {
        customOptions(_a) {
            var { isTest, isModern, emitDecoratorMetadata } = _a, loader = __rest(_a, ["isTest", "isModern", "emitDecoratorMetadata"]);
            return {
                custom: { isTest, isModern, emitDecoratorMetadata },
                loader,
            };
        },
        config(cfg, { customOptions: { isTest, isModern, emitDecoratorMetadata } }) {
            // Add hint to our babel preset so it can handle modern vs legacy bundles.
            cfg.options.caller.isModern = isModern;
            cfg.options.caller.isTest = isTest;
            cfg.options.caller.emitDecoratorMetadata = emitDecoratorMetadata;
            return cfg.options;
        },
    };
});
