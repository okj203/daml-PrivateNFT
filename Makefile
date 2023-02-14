build:
	cd daml-nft && daml build
	cd daml-nft && daml codegen js -o daml.js .daml/dist/*.dar
	cd ui && yarn install
	cd ui && yarn build

deploy: build
	mkdir -p deploy
	cp daml-nft/.daml/dist/*.dar deploy

clean:
	cd daml-nft && rm -rf .daml
	cd daml-nft && rm -rf daml.js
	rm -rf deploy
	cd ui && rm -rf build
	cd ui && rm -rf node_modules
	cd ui && rm -rf yarn.lock