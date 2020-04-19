<p align="center">
  <a href="" rel="noopener">
 <img width=400px  src="https://user-images.githubusercontent.com/35429211/76151624-b3377e80-60bf-11ea-94e5-d55c9a515dc1.png" alt="Oud image"></a>
</p>

<h1 align="center"> :musical_score: Oud </h1>


[![GitHub contributors](https://img.shields.io/github/contributors/Hassan950/OudBackEnd)](https://github.com/Hassan950/OudBackEnd/contributors)
[![GitHub issues](https://img.shields.io/github/issues/Hassan950/OudBackEnd)](https://github.com/Hassan950/OudBackEnd/issues)
[![GitHub forks](https://img.shields.io/github/forks/Hassan950/OudBackEnd)](https://github.com/Hassan950/OudBackEnd/network)
[![GitHub stars](https://img.shields.io/github/stars/Hassan950/OudBackEnd)](https://github.com/Hassan950/OudBackEnd/stargazers)
[![GitHub license](https://img.shields.io/github/license/Hassan950/OudBackEnd)](https://github.com/Hassan950/OudBackEnd/blob/master/LICENSE)


## Table of Contents

- [About the Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Database Seeds](#database-seeds)
  - [Environmental Variables](#environmental-variables)
  - [Running](#running)
- [Testing](#testing)
  - [Running Unit Tests](#running-unit-tests)
  - [Generating Coverage Report](#genreating-coverage-report)
- [API Documentation](#api-documentation)
- [Functional Documentation](#functional-documentation)
- [Roadmap](#roadmap)
- [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

Music Player API with Node.js Express

### Built With

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [Jest](https://jestjs.io)
- [MongoDB](https://www.mongodb.com)

<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repo

```sh
git clone https://github.com/Hassan950/OudBackEnd.git
```

2. Install dependencies

```sh
npm install
```

### Database Seeds
1. Clear database

```sh
node ./src/dev-data/data/import-data.js --delete
```

2. Import Seeds
```sh
node ./src/dev-data/data/import-data.js --import
```
 
 ### Environmental Variables

 For developers, you can directly use our `development.json` located in `config\development.json` or modify it if you like.

 For production, you need to make your own `config\production.json` with the following structure.
 
 ```json
{
  "JWT_KEY": "fooPassword",
  "JWT_EXPIRES_IN": "30d",
  "FBClientID": "1",
  "FBClientSecret": "2",
  "GoogleClientID": "3",
  "GoogleClientSecret": "4Bar",
  "SENDGRID_API_KEY": "6Baz",
  "db": "mongodb://localhost:27017/YourCollection",
  "PORT": "3000",
  "NODE_ENV": "production"
}
 ```
* `JWT_KEY`: Your json web token secret key.
* `JWT_EXPIRES_IN`: The period token can last before expiring expressed in seconds or a string describing a time span
  > Eg: `60`, `"2 days"`, `"10h"`, `"7d"`. A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc), otherwise milliseconds unit is used by default (`"120"` is equal to `"120ms"`).
* `FBClientID` and `FBClientSecret`: Are used for signing up with facebook.
* `GoogleClientID` and `GoogleClientSecret`: Are used for signing up with google.
* `SENDGRID_API_KEY`: The api key for sending emails through sendgrid
* `db`: Your database path 
  > Eg: `"mongodb://localhost:27017/YourCollection"` If you're hosting on your localhost server.
* `PORT`: Your api hosting port
* `NODE_ENV`: It **must** be `"production"` in order to run the api on production otherwise use `config\development.json`

### Running

1. Running on development

```sh
npm start
```

2. Running on production

Upon creating `config\production.json` like in [Environmental Variables](#environmental-variables) section. run this script:

```sh
npm run start-prod
```


<!-- TESTING -->

## Testing
The tests can be found in ````tests````, and each controller has its own test file in ````tests\unit\controller````. Mongoose models tests are also found in ````tests\unit\models```` as well as middleware which is located at ````tests\unit\middlewares````.

### Running Unit Tests

run the following script:
```sh
npm test
```

### Generating Coverage Report

By default, upon running `npm test` this prints the coverage report in console as well as generating an html version located at ````coverage\index.html````.
alternatively, you can run:
```sh
npx jest --coverage
```

<!-- API DOC -->

## API Documentation

1. install `redoc-cli` globally:
```sh
npm i redoc-cli -g
```

2. run the following `redoc-cli` command:
```sh
redoc-cli bundle docs/openapi.yaml -o docs/apidoc.html
```

it will generate an html file `apidoc.html` located at `docs/apidoc.html`. 

<!-- FUNC DOC -->

## Functional Documentation

install the latest version on npm globally (might require `sudo` if you are on linux):
```sh
npm install -g jsdoc
```

in order to generate the documentation, run the `jsdoc` command:
```sh
jsdoc -r ./src
```
By default, the generated documentation is saved in a directory named `out`. You
can use the `--destination` (`-d`) option to specify another directory.

## Roadmap

See the [open issues](https://github.com/Hassan950/OudBackEnd/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b AmazingFeature-Feat`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin AmazingFeature-Feat`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->

## Contact

Abdelrahman Tarek - abdelrahman.tarek1910@gmail.com  
Ahmed Magdy - omagdy837@gmail.com  
Hassan Mohamed - hmibrahim1999@gmail.com  
Mohamed Abo Bakr - Mo.abobakr.11@gmail.com  

Project Link: [https://github.com/Hassan950/OudBackEnd](https://github.com/Hassan950/OudBackEnd)


