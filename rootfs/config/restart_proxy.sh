#!/bin/sh

CURRENT_PID=`cat /var/run/haproxy.pid`
echo "Saving current server status list - current process" $CURRENT_PID
echo "show servers state" | socat unix-connect:/var/run/haproxy.sock - > /config/server_state

haproxy -c -q -f /config/haproxy.cfg
if [ $? -ne 0 ]; then
  echo "Errors found in configuration file, Restoring backup haproxy.cfg.bak" 1>&2
  mv /config/haproxy.cfg /config/haproxy.cfg.err
  cp /config/haproxy.cfg.bak /config/haproxy.cfg
fi

echo "File validated. Applying new configuration file"
haproxy $HAPROXY_DAEMON_ARGS -sf $(cat /var/run/haproxy.pid)
