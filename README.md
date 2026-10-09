# AEM Assessment — Angular & Electron Dashboard

A desktop dashboard application built with **Angular 14** and **Electron**, featuring authentication, data visualization, and offline data access.

## Overview

This project was developed as part of a technical assessment. It demonstrates the integration of a web application with a desktop environment, including authentication, dashboard visualization, and local data caching for offline access.

## Features

* **Authentication** — Login using the provided API.
* **Route Protection** — Angular route guards protect the dashboard route.
* **HTTP Interceptor** — Automatically attaches the authentication token to outgoing HTTP requests when available.
* **Interactive Dashboard** — Displays donut and bar charts using D3.js.
* **User Table** — Presents user information retrieved from the dashboard API.
* **Offline Authentication** — Supports offline login using previously verified credentials stored locally.
* **Offline Dashboard Cache** — Stores the latest successful dashboard response using PouchDB and retrieves cached data when the API is unavailable.
* **Offline Status Indicator** — Displays an offline banner and the last cache synchronization time when cached dashboard data is used.
* **Electron Desktop Application** — Runs the Angular application in a desktop environment.

## Technologies Used

* Angular 14
* TypeScript
* Electron
* RxJS
* D3.js
* PouchDB
* Bootstrap
* Node.js
* npm

## Prerequisites

Ensure the following tools are installed:

* Node.js 16.x
* npm 8.x or a compatible version
* Git

The project was developed and tested using Node.js 16.20.2 and npm 8.19.4.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wanieyfadzil/AEM_Norfadilatul_Electron.git
   ```

2. Navigate to the project directory:

   ```bash
   cd AEM_Norfadilatul_Electron
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Running the Application

Start the application in development mode:

```bash
npm run electron:dev
```

This command starts the Angular development server and launches the Electron desktop application.

Keep the terminal open while using the application in development mode.

## Authentication and Offline Behaviour

### Online Mode

When the API is available, the application sends login requests to the configured authentication endpoint. Successfully retrieved dashboard data is displayed and cached locally.

### Offline Mode

When the API is unreachable or returns a server error, the application attempts to retrieve previously cached dashboard data from PouchDB.

If cached data is available, the dashboard displays the stored charts and user information alongside an offline status indicator.

Offline authentication uses credentials previously verified by the online API and stored locally in hashed form.

**Note:** Offline access depends on previously saved credentials and cached dashboard data. It is not intended to replace server-side authentication or production-grade security controls.

## Building the Angular Application

To build the Angular application, run:

```bash
npm run build
```

The generated build output is written to the configured Angular output directory.

## Project Structure

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── features/
│   │   ├── dashboard/
│   │   └── sign-in/
│   └── app-routing.module.ts
├── assets/
└── typings/
```

* `core/guards/` — Route access control.
* `core/interceptors/` — HTTP request interception.
* `core/services/` — Authentication, offline authentication, and dashboard data services.
* `features/sign-in/` — Sign-in interface.
* `features/dashboard/` — Dashboard interface, charts, and user table.
* `typings/` — Additional TypeScript declarations.

## Notes

* The application requires network access for online authentication and fresh dashboard data.
* Offline functionality requires previously cached data or previously verified credentials.
* Dashboard information displayed offline may be outdated.
* API availability and response formats depend on the configured backend service.

## Author

**Waniey Fadzil**

GitHub: [wanieyfadzil](https://github.com/wanieyfadzil)

## License

This project was created for assessment purposes. No license has been specified.
