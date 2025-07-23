
USER_ID = $(shell id -u)
GROUP_ID = $(shell id -g)

export UID = $(USER_ID)
export GID = $(GROUP_ID)

install:
	@echo "Installing and building ra-apisix-oidc dependencies..."
	npm install -w @arte/ra-apisix-oidc
	@make build-ra-apisix-oidc
	@echo "Installing demo dependencies..."
	npm install -w demo
	@echo "Installing demo-api dependencies..."
	npm install -w demo-api

build-ra-apisix-oidc:
	@echo "Building ra-apisix-oidc..."
	ARTE_NPMJS_TOKEN= npm run build -w @arte/ra-apisix-oidc

start-demo:
	@echo "Starting demo..."
	docker compose up -d --force-recreate
	@echo "Demo started. Access it at http://localhost:9080"
	
stop-demo:
	@echo "Stopping demo..."
	docker compose down

publish:
	@echo "Publishing ra-apisix-oidc package..."
	npm publish -w @arte/ra-apisix-oidc --access public
