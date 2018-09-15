# nodejs

A barebones Node.js app using Express 4, Passport.js and Typescript.

### Deployment

All the deployment configuration and scripts are located in "development" folder of this project.

The deployment is automated using a Python3 script to start a Docker Swarm cluster with 3 networks, 2 public (reverse_proxy, log_collector) and a private one (nodejs).

- The public __reverse_proxy__ network is used for reverse proxy, load balancing, TLS/SSL termination and for better security practices.
- The public __log_collector__ network is used just for logging purposes.
- The private __nodejs__ network is used for all the containers that are hidden from public access. The only way to access these containers is through reverse proxy service.

### Local setup

Requirements: Python3, Node 10, Docker 18.06+ and openssl.

Run the __./deployment/scripts/docker/swarm/run.py__ script.

The default proxy development configuration [ deployment/configuration/reverse-proxy/traefik.toml ] is using "nodejs.dev" as the domain, please make sure to change the local DNS entry to point "nodejs.dev" to localhost (127.0.0.1)

To be able to open it in the browser at https://nodejs.dev/typescript make sure to add the local generated the self-signed certificate that is located at: [ /development/config/reverse-proxy/certificates/nodejs.root.crt ] as a Trusted Authority.  

### Logging

Fluentd is an open source data collector, which lets you unify the data collection and consumption for a better use and understanding of data. All existing containers are configured to use docker "fluentd" logging driver and redirects all the standard output to files located in the __logs__ folder.


### Best practices

For JavaScript and TypeScript code the https://standardjs.com/ is used.
