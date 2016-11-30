palsweb
=======

## FAQ:

### How do I connect to an external redis server?

By default palsweb connects to a redis server at the host 127.0.0.1 and port 6379. If you want to use different values set the following environment variables:

    REDIS_HOST=127.0.0.1
    REDIS_PORT=6379

### How do I run palsweb?

    cd palsweb/pals
    meteor --port=80
