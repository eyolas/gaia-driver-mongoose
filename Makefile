test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony-generators \
		test/withoutgaiajs.js \
		test/generatorController.js \
		test/injector.js \
		--bail

.PHONY: test 