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

* VirtualBox VM(CPUx4) on mac
```
vagrant@mdm-vm:~/mongo-mysql$ node index.js
mysql insert: 30288ms
mongo insert: 18193ms
mysql-json insert: 27866ms
mysql select: 89ms
mongo select: 230ms
mysql-json select: 115ms
```
