# mushin-hoodie

A GTD app prototype based on [Stephan Bönnemann's](http://boennemann.me/)
zentodone app.

## Installation

### Install OS specific dependencies

#### OS X

```shell
brew update
brew install git
brew install node
brew install couchdb
```

#### Linux

##### General

```shell
sudo apt-get update
sudo apt-get install couchdb git
tar -xvf node-v0.10.10.tar.gz
cd node-v0.10.10
./configure
make && sudo make install
```

##### Ubuntu

```shell
sudo apt-get update
sudo apt-get install couchdb-bin git
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

##### Fedora

```shell
sudo yum install couchdb git nodejs npm
```

#### Windows

On Windows, install [Node.js](http://nodejs.org/download/), [git](http://git-scm.com/downloads) and [CouchDB](https://couchdb.apache.org/#download) using the installers on each website.

### Install project specific dependencies

```
npm install -g grunt-cli hoodie-cli bower
npm install
bower install
```

## Build

Build the App and start Hoodie

```shell
grunt build
hoodie start
```

## Development

Start Hoodie and serve a development version of the App with Livereload.

```
grunt serve
```

## Author
| [![twitter/thomasvs](http://gravatar.com/avatar/f5dc647e1f30b6127527da3dbfdaba73?s=70)](https://twitter.com/thomasvs "Follow @thomasvs on Twitter") |
|---|
| [Thomas Vander Stichele](http://thomas.apestaart.org/) |
