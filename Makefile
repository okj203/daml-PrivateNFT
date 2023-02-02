build:
	cd myNFT && daml build
	cd myNFT && daml codegen js -o daml.js .daml/dist/*.dar

deploy: build
	mkdir -p deploy
	cp myNFT/.daml/dist/*.dar deploy

clean:
	cd myNFT && rm -rf .daml
	cd myNFT && rm -rf daml.js
	rm -rf deploy