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

* Insert parallel


#### Results sample

* VirtualBox VM(CPUx4) on mac
```
vagrant@mdm-vm:~/mongo-mysql$ node index.js
mysql insert parallel: 19123ms
mongo insert parallel: 5000ms
mysql-json insert parallel: 19679ms
mysql select: 78ms
mongo select: 126ms
mysql-json select: 103ms
```
