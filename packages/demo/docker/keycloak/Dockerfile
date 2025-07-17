FROM quay.io/keycloak/keycloak:22.0
COPY --chown=keycloak:keycloak packages/demo/docker/keycloak/realms /opt/keycloak/data/import/
RUN /opt/keycloak/bin/kc.sh build
