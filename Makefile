
install: 
	@echo "Installing ra-apisix-oidc dependencies..."
	npm install

build-ra-apisix-oidc:
	@echo "Building ra-apisix-oidc..."
	cd packages/ra-apisix-oidc && npm install && npm run build

install-demo:
	@echo "Installing demo dependencies..."
	cd packages/demo && npm install

start-demo: install-demo
	@echo "Starting demo..."
	docker compose up -d --force-recreate
	@echo "Demo started. Access it at http://localhost:9080"
	
stop-demo:
	@echo "Stopping demo..."
	docker compose down

publish:
	@echo "Publishing ra-apisix-oidc package..."
	cd packages/ra-apisix-oidc && npm publish --access public
