### Mongo Mysql Test Performance in Nodejs

#### Installation

```
git clone https://github.com/webcaetano/mongo-mysql.git
cd mongo-mysql
npm install
node index
```

#### Changes

* Add MySQL json (MySQL5.7)

* Fix select to FAIR for mongod

* Create fake data before insert


#### Results sample

* VirtualBox VM(CPUx4) on mac
```
vagrant@mdm-vm:~/mongo-mysql$ node index.js
mysql insert: 23033ms
mongo insert: 10766ms
mysql-json insert: 22071ms
mysql select: 78ms
mongo select: 176ms
mysql-json select: 110ms
```
