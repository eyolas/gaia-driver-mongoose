REPORTER ?= dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--require should \
		--harmony-generators \
		test/*.js \
		--bail

.PHONY: test 