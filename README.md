# SensRNet Registry Frontend

This is the frontend repo of SensRNet. 

## local development server Ng

Prerequisites:
- Install node.js (https://nodejs.org/en/)
- Connect with VPN

Commands:
- Set registry: 'npm config set registry https://dev-brm.cs.kadaster.nl/artifactory/api/npm/npm-registry/'
- Run: 'npm install'
- Run: 'ng serve' (for a dev server. Navigate to "http://localhost:4200/". The app will automatically reload if you change any of the source files)

## local development server with docker:

Prerequisites:
- Install docker 

Commands: 
- Run: docker-compose build
- Run: docker-compose up

## Find Us

* [GitHub](https://github.com/kad-busses)
* [GitHub](https://github.com/kad-griftj)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Stefan Bussemaker** - *Initial work* - [Kadaster](https://kadaster.nl)
* **Jeroen Grift** - *Initial work* - [Kadaster](https://kadaster.nl)

See also the list of [contributors](https://github.com/your/repository/contributors) who 
participated in this project.

## License

This project is licensed under the EUPL License - see the [LICENSE.md](LICENSE.md) file for details.
