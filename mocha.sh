#!/bin/bash

# this script is used to run all or standalone mocha scripts
# like this:
#    ./mocha.sh
# OR
#    ./mocha.sh test/unit/model/user.js

# tried also gulp-mocha and node `which gulp` test,
# but it hangs after tests, not sure why, mocha.sh works fine so leave it as is
 NODE_PATH=./handlers:./modules NODE_ENV=test mocha --reporter spec --colors --timeout 100000 --require lib/mongoose --require should --require co --require co-mocha --recursive --ui bdd -d $*
