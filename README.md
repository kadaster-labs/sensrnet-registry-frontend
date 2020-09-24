# SensRNet Registry Frontend

<p align="center">
    <img src="src/assets/SensRNet-logo.png" height="180">
</p>
<p align="center">
    <a href="https://github.com/kadaster-labs/sensrnet-registry-frontend/releases" alt="Version">
        <img src="https://img.shields.io/github/package-json/v/kadaster-labs/sensrnet-registry-frontend" />
    </a> 
    <a href="https://github.com/kadaster-labs/sensrnet-registry-frontend/graphs/contributors" alt="Contributors">
        <img src="https://img.shields.io/github/contributors/kadaster-labs/sensrnet-registry-frontend" />
    </a>
    <a href="https://github.com/badges/shields/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/kadaster-labs/sensrnet-registry-frontend" />
    </a>
    <a href="https://sonarcloud.io/dashboard?id=kadaster-labs_sensrnet-registry-frontend" alt="Quality Gate">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=kadaster-labs_sensrnet-registry-frontend&metric=alert_status" />
    </a>
    <a href="https://sonarcloud.io/dashboard?id=kadaster-labs_sensrnet-registry-frontend" alt="Lines of code">
        <img src="https://sonarcloud.io/api/project_badges/measure?project=kadaster-labs_sensrnet-registry-frontend&metric=ncloc" />
    </a>
</p>

This is the repo for the frontend component of SensRNet. For the how and why of the SensRNet project, please start at our [main repo](https://github.com/kadaster-labs/sensrnet-home).

## Getting started
Before starting with development, you'll need the following things:
- [Node.js v12](https://nodejs.org/en/)
- Angular CLI: `npm install -g @angular/cli`
- Install dependencies: `npm install` 

*Note: this project contains some closed source Kadaster dependencies. This is planned to change, but for now it means that this project can only be built when connected to the Kadaster VPN. The NPM registry is set in `.npmrc`.*

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

## Building Docker images
Deployment is done in an Azure Kubernetes Service (AKS) cluster. For releases, run `./scripts/release.sh`. It updates the package version and builds the Docker images. Additionally, it pushes the newly created images to the Azure Container Registry (ACR).

*Note: since VPN is still required for building the project, this script won't work as is. For the `npm install` step the VPN is required, but for `az acr login` is needs to be off. Easiest for now is to run this script line for line, enabling VPN just before `npm install` and disabling right after.*

## Deployment
Once the images are available in the container registry, deployment can be done (on Kubernetes) by using Kustomize and the desired config, i.e.
`kustomize build deployment/overlays/gemeente-a | kubectl apply -f -`

## Internationalization + Localization
A comprehensive guide on how to do i18n and l10n in Angular is found at https://angular.io/guide/i18n. In its most basic form, the custom attribute `i18n` is placed on HTML elements. A translation file can then be generated with `ng xi18n --output-path src/locale`. This file can be duplicated for each extra language and its duplications can be translated using standard translation tools, for example Poedit. Then, during building, Angular generates alternative sites for each language, exposing them under different URL path, for example /nl/ for Dutch. 

## Find Us

* [GitHub](https://github.com/kadaster-labs/sensrnet-home)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Maintainers

Should you have any questions or concerns, please reach out to one of the project's [Maintainers](./MAINTAINERS.md).

## License

This work is licensed under a [EUPL v1.2 license](./LICENSE.md).
