
USER_ID = $(shell id -u)
GROUP_ID = $(shell id -g)

export UID = $(USER_ID)
export GID = $(GROUP_ID)

install: build-ra-apisix-oidc
	@echo "Installing ra-apisix-oidc dependencies..."
	npm install

build-ra-apisix-oidc:
	@echo "Building ra-apisix-oidc..."
	cd packages/ra-apisix-oidc && npm install && ARTE_NPMJS_TOKEN= npm run build

start-demo:
	@echo "Starting demo..."
	docker compose up -d --force-recreate
	@echo "Demo started. Access it at http://localhost:9080"
	
stop-demo:
	@echo "Stopping demo..."
	docker compose down

publish:
	@echo "Publishing ra-apisix-oidc package..."
	cd packages/ra-apisix-oidc && npm publish --access public
