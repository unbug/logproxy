logproxy
========
set up a proxy to log http archives

Install
========
```shell
npm install -g logproxy
````

Commands
=========
```shell
node logproxy [listen port] [only log host,..]
```

eg.
=====
1.start logproxy with default setting
```shell
node logproxy
```
2.listen on port 8088 and only log hosts -- 'c.163.com' and every host matchs '126.com'
```shell
node logproxy 8088 c.163.com,*126.com


<img src="https://lh4.googleusercontent.com/-LLOq43DK_9g/UtrewcMwPDI/AAAAAAAAI2o/6k_98Lyk1BI/w954-h551-no/Snip20140119_71.png"/>
