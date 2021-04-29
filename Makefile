
ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

.PHONY: build

compile:
	@docker run -it --workdir /src --rm -v $(ROOT_DIR):/src ethereum/solc:0.4.25 --abi --bin staking.sol -o dist

test:
	@go test

build:
	@mkdir -p build
	@go build -o build/main cmd/main.go

cloc:
	@gocloc --not-match-d="coverage.*|node_modules" . 
