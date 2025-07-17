install:
	npm install

build:
	cd packages/ra-apisix-oidc && npm run build
	cd packages/demo && npm run build

start-demo:
	docker compose up -d --force-recreate
stop-demo:
	docker compose down

publish:
	cd packages/ra-apisix-oidc && npm publish
