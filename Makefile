install: build-ra-apisix-oidc
	cd packages/demo && npm install

build-ra-apisix-oidc:
	cd packages/ra-apisix-oidc && npm install && npm run build

start-demo: install
	docker compose up -d --force-recreate
	echo "Demo started. Access it at http://localhost:9080"
	
stop-demo:
	docker compose down

publish:
	cd packages/ra-apisix-oidc && npm publish --access public
