
# Run the project
To start the server locally and connect to dev services:
```
yarn start-ngrok
```

To access auth routes, you will need https. Use ngrok to tunnel to a valid domain:
```
ngrok http -region=us -hostname=lstv2web2.ngrok.io 8080
ngrok http -region=us -hostname=<your_approved_hostname> 8080
```

# Design System — Storybook


The application has Storybook setup as a means of documenting and displaying all of our components in a stateless form to be able to test all edge cases. Whenever you create a new component, it is best to add a `.stories.js` file next to it in order to show how to use it and how it looks.

## Run Storybook

To run it locally:
```
yarn storybook
```

To build statically for deployments:
```
yarn build-storybook
```

## Resources on Storybook
Components can mostly be built out of smaller components, with the smallest being individual atomic components (canonical html or thin styling wrappers)
For guidance on which components to build see: 

**For more information on maintaining storybook, see docs here:**
learnstorybook.com/intro-to-storybook/react/en/get-started/
learnstorybook.com/design-systems-for-developers/react/en/introduction/
learnstorybook.com/visual-testing-handbook/  -- Not currently used, but nice-to-have in long-term as team and system grows to include QA.

**TODO: Publish the Storybook so it can be deployed and versioned and tested by design**
https://storybook.js.org/docs/react/workflows/publish-storybook