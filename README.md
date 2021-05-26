# SensRNet Registry Frontend

<p align="center">
    <img src="src/assets/SensRNet-logo.png" height="180">
</p>
<p align="center">
    <a href="https://github.com/kadaster-labs/sensrnet-registry-frontend/releases" alt="Version">
        <img src="https://img.shields.io/github/package-json/v/kadaster-labs/sensrnet-registry-frontend" />
    </a>
    <a href="https://github.com/kadaster-labs/sensrnet-registry-frontend/actions?query=workflow%3A%22Node.js+CI%22" alt="Build status">
        <img src="https://github.com/kadaster-labs/sensrnet-registry-frontend/workflows/Node.js%20CI/badge.svg" />
    </a>
    <a href="https://sonarcloud.io/dashboard?id=kadaster-labs_sensrnet-registry-frontend" alt="Quality Gate">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=kadaster-labs_sensrnet-registry-frontend&metric=alert_status" />
    </a>
</p>

This is the repo for the frontend component of SensRNet. For the how and why of the SensRNet project, please start at our [main repo](https://github.com/kadaster-labs/sensrnet-home).

## Getting started
Before starting with development, you'll need the following things:
- [Node.js v12](https://nodejs.org/en/)
- Angular CLI: `npm install -g @angular/cli`
- Install dependencies: `npm install`

The VS Code editor with ESLint plugin is recommended, but not required.

## Project structure
The project is roughly structured as follows: it contains 3 pages. The two secondary ones are the user login and register pages. The main one is the viewer, which contains a map displaying all registered sensors. Additionally, the viewer is used to update owner information, and register and update sensors.

Information management is mostly done by filling in forms, for which we use Angular Reactive Forms. Some of the input fields have been isolated into component for easier testing and code reuse. The main forms are `sensor-register`, `sensor-update` and `owner-update`, with smaller components being defined in `src/app/form-controls/`.

## Local development
Running `npm run start` starts an Angular development server. Navigate to http://localhost:4200/ to view the site. The app will automatically reload if you change any of the source files.

## Simulating different nodes
During the development of the walking skeleton, we wanted to show how multiple environment can work together. For this purpose, the app has been setup as a white label app.
For different 'costumers' we can define different environment variables and stylesheets.
You can run the different scenarios as follows:
Commands:
- `ng serve --project=gemeente-a`
- `ng serve --project=gemeente-b`
- `ng serve --project=viewer`

Building for deployment is then adding an additional flag `--configuration=production`.

The different configuration are defined in `angular.json` as different projects. The corresponding stylesheets are to be placed in `src/environments/`.

## Local app deployment with Docker:
Note: Docker CE is required for building the images.

Commands:
- `docker-compose up --build`

## Deployment
Once the images are available in the container registry, deployment can be done (on Kubernetes) by using our Helm Charts. They can be found at https://github.com/kadaster-labs/sensrnet-helm-charts.

## Internationalization + Localization
The default language for the UI is English. However, since during the MVP process the main audience is Dutch, the site serves the Dutch content by default. Since the app is internationalized, we also have the possibility to easily translate and launch the site in a different language later on.

### Development
A comprehensive guide on how to do i18n and l10n in Angular is found at https://angular.io/guide/i18n. In its most basic form, the custom attribute `i18n` is placed on HTML elements. A translation file can then be generated with
```
npm run extract-i18n
```
Each language gets its own translation file and can be translated using standard translation tools, for example Poedit. Angular tooling currently only supports generating translation files ones. This means that whenever we update the site and regenerate the translation files, we've lost a previous translations. There is no build-in way to update the current translations. For this reason, we use the [xliffmerge](https://github.com/martinroob/ngx-i18nsupport/wiki/Tutorial-for-using-xliffmerge-with-angular-cli) tools, which does exactly that. The new and changed translations are marked as such, allowing us to translate the site in an incremental way.

A drawback is that languages cannot be swapped out using the Angular development server. To inspect a different language, the server has to be restart with a different configuration. We've provided the following commands to use:
```
npm run start     # starts development server using English locale
npm run start-nl  # starts development server with Dutch locale
```

When the app is built, different static sites are generated for each locale. Routing is therefore done in nginx.

## Testing
Tests can be run using `npm run test`, which launches an headless Chrome browser to run the tests in. Please consult https://developers.google.com/web/updates/2017/04/headless-chrome#cli for local installation and setup. For CI purposes, we've included a Dockerfile with which the correct environment can easily be configured. This way, tests can be run by running `./run-tests.sh`.

## Find Us

* [GitHub](https://github.com/kadaster-labs/sensrnet-home)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Maintainers

Should you have any questions or concerns, please reach out to one of the project's [Maintainers](./MAINTAINERS.md).

## License

This work is licensed under a [EUPL v1.2 license](./LICENSE.md).
