# LSTV Admin

## How to setup environment variables

`.env.development`
`.env.staging`
`.env.production`

## Typical Stacks

React / Typescript / Material UI / React-Query / Axios

## Required environment

Node version: >=12.18.3

Npm version: >=6.14.6

## Run Scripts

Locally, the project will run at port 3000. `http://localhost:3000/`

### To run the project locally with different environments,

```
yarn start
yarn start:local
yarn start:staging
yarn start:prod
```

### To build the project,

-   Local environment

    ```
    yarn build:local
    ```

-   Staging enviroment

    ```
    yarn build:staging
    ```

-   Production environment

    ```
    yarn build:local
    ```

### To run the lint,

**Run lint**

```
yarn lint
```

**Fix lint errors automatically**

```
yarn lint:fix
```
