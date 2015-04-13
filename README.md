logproxy
========
Set up a proxy server to log http archives of your mobile devices.

<img src="https://lh4.googleusercontent.com/-LLOq43DK_9g/UtrewcMwPDI/AAAAAAAAI2o/6k_98Lyk1BI/w954-h551-no/Snip20140119_71.png"/>

Install
========
```shell
npm install -g logproxy
````

Commands
=========
```shell
logproxy [listen port] [only log host,..]
```

eg.
=====
1.start logproxy with default setting
```shell
logproxy
```
2.listen on port 8088 and only log hosts -- 'c.163.com' and every host matchs '126.com'
```shell
logproxy 8088 c.163.com,*126.com
```

Guide
=========
After run `logproxy`,you will see a log ` PROXY IS READY ON 192.168.1.102 PORT 1630`,set your device's http proxy to the IP address and port.