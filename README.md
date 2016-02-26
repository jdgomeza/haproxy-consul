# haproxy-consul image

This image intention is to put together the best practices around the `HAProxy - Consul` set up in order to create a truly turnkey dynamic load balancer solution for docker containers.

## Versions

- HAProxy 1.6.3 (Based on Alpine janeczku/alpine-haproxy:1.6.3)
- Consul-template 0.13.0 (Compiled with go 1.6!)
- S6 Overlay (v1.17.1.2)

## Features

* Auto-configured reverse proxy for your registered services. Just TAG them as `http` in Consul and you can access them by subdomain or url. For example the service name `webapp` automatically is available by:
  - webapp.domain.com (Add a wildcard DNS record or individual records per app)
  - domain.com/webapp/ (Ideal for APIs)
* HAProxy soft restart fixed (no more zombie processes after consul reconfiguration- [consul-template 0.13.0](https://github.com/hashicorp/consul-template/issues/442#issuecomment-185814085))
* Supervised consul-template process (reloaded if fails without affecting HAProxy - [s6 overlay](https://github.com/just-containers/s6-overlay#features))
* haproxy.cfg validation before restarting HAProxy (using backup until a new valid config is generated)
* [Seamless server states](http://blog.haproxy.com/2015/10/14/whats-new-in-haproxy-1-6/) (load-server-state-from-file)
* Soft HAProxy shutdown (thanks to S6 overlay)
* Session stickiness for stateful legacy apps/APIs. Just add the `stateful` service tag  (ref. [Using application session cookie for persistence](http://blog.haproxy.com/2012/03/29/load-balancing-affinity-persistence-sticky-sessions-what-you-need-to-know/))
* Multiple dynamic configurations

## TODOs

* More sample applications and load tests
* Separate consul-template and HAProxy. Explore signaling containers or XML RPC.
* Graceful hot service version switch/rollback for stateful apps (e.g. 1.1 to 1.2 with Zero downtime)  (up, drain and down mode)

## HAProxy - consul_template

This image starts up a dynamically configured HAProxy server. The configuration is automatically generated based on the services registered in a [Consul Server](https://www.consul.io/). The image also starts  [consul-template](https://github.com/hashicorp/consul-template#consul-template). This process is in charge of watching for `Consul` changes and for updating the HAProxy template.

After `consul_template` updates the `haproxy.cfg` configuration file, the container validates the changes and if the new configuration is valid, then it restarts the `haproxy` server. Otherwise, the load balancer server is not restarted.

This is an important feature that avoids `haproxy` outages in case the generated template gets corrupted.
> The `haproxy.ctmpl` template has extension points that allow to dynamically inject `HAProxy parameters`, so if not done carefully, it might corrupt the configuration file. Fortunately it won't affect the load balance service.

The image lifecycle is initiated, monitored and finalized by S6. See more details here ([S6 overlay](https://github.com/just-containers/s6-overlay)).

### Initialization phase

1. The container executes `consul_template` and generates an initial `haproxy.cfg` template.
2. Starts the `haproxy` applications as a Daemon.

If the 'HAProxy' server or the `consul_template` app fails to start, the container exits immediately. You can override this behavior by changing the environment variable `S6_BEHAVIOUR_IF_STAGE2_FAILS=1`. Please see how to [customize S6 Overlay behavior](https://github.com/just-containers/s6-overlay#customizing-s6-behaviour)

## How to use this image

Before you can use this image, you need a consul server running. Also, you may like to use [registrator](http://gliderlabs.com/registrator/latest/) to automatically add your services to consul.

Please refer to the compose file `docker-compose.yml` for an example.

```bash
$ git clone https://github.com/jdgomeza/haproxy-consul.git
$ cd haproxy-consul
$ docker-compose up
$ curl localhost/webapp
```

### Adding a new services

If running `Registrator`, [just add labels](http://gliderlabs.com/registrator/latest/user/services/#examples). If not, then register the service directly in [consul using the API](https://www.consul.io/docs/agent/http/catalog.html#catalog_register)

## Tests

TODO
