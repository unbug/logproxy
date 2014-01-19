logproxy
========

  <h2>set up a proxy to log http archives</h2>
 * run:
  <p>`node logproxy [listen port] [only log host,..]`</p>
 * eg.
 * 1.start logproxy with default setting
  <p>`node logproxy`
 * 2.listen on port 8088 and only log hosts -- 'c.163.com' and every host matchs '126.com'
   <p>`node logproxy 8088 c.163.com,*126.com`</p>

<img src="https://lh4.googleusercontent.com/-LLOq43DK_9g/UtrewcMwPDI/AAAAAAAAI2o/6k_98Lyk1BI/w954-h551-no/Snip20140119_71.png"/>
