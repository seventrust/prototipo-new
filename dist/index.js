"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const Dataset_1 = require("./routes/Dataset");
const port = process.env.PORT || 3000;
App_1.default.use('/', Dataset_1.default);
App_1.default.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }
    return console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map