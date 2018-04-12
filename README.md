# Chikatch Console

[![Build Status](https://travis-ci.org/shop021/chikatch.svg?branch=master)](https://travis-ci.org/shop021/chikatch)

Chikatch is a project of wireless psyllium sysytem for small scale performance.
This app is a controller of the system for macOS and Windows, built on Electron.

## System overview

WIP

## Components

- Psyllium
    - WIP
- Console
    - Check [releases](https://github.com/shop021/chikatch/releases).

## Development


### Start app

To get started just `yarn start`.

```$xslt
// install and build node modules
$ yarn

// Start as electron app
$ yarn start
```

### Packaging

```$xslt
// macOS
$ yarn run pack:mac
$ ls dist/Chikatch\ Console-x.y.z.dmg

// Windows
$ yarn run pack:win
$ ls dist/Chikatch\ Console\ Setup\ x.y.z.exe
```

### Environment

- Node.js v8.9.x (Recommend)


## License

MIT
