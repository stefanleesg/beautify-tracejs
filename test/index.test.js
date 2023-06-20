const beautify = require('../lib/index.js');
const assert = require('assert').strict;


describe("Test beautify-tracejs", function() {
    it("test beautify-tracejs can read source file", function() {

        console.log(new Error("Stack trace before beautify-tracejs register"))

        beautify.register()

        let randomStr = "ThatTrackSourceCode"
        let err = new Error("Stack trace after beautify-tracejs register");

        console.log(err)

        assert.ok(err.stack.includes(randomStr))

        beautify.unregister()
    });
});