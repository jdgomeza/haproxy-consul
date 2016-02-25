# haproxy-consul

This image intention is to put together the best practices around the `HAProxy - Consul` set up in order to create a truly turnkey dynamic load balancer solution for docker containers.

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

Before you can use this image, you need to have a consul server running. Also, you may like to use [registrator](http://gliderlabs.com/registrator/latest/) to automatically add your services to consul.

Please refer to the compose 
