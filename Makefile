TESTS = test/spec
REPORTER = spec
MOCHA = ./node_modules/mocha/bin/mocha
_MOCHA = ./node_modules/mocha/bin/_mocha
ISTANBUL = ./node_modules/istanbul/lib/cli.js

test: test-mocha

test-mocha:
	$(MOCHA) --timeout 200 $(TESTS) --reporter spec

test-cov: istanbul

istanbul:
	$(ISTANBUL) cover $(_MOCHA) -- -R spec test/spec

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

clean:
	rm -rf ./coverage