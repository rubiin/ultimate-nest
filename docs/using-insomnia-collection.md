# Testing Insomnia collection

The repository consists of an insomnia collection to quickly test the apis in insomnia

## Prerequisites

## Import the data
The steps for importing data `collection.json` can be read at : https://docs.insomnia.rest/insomnia/import-export-data
We are using the insomnia faker plugin to input data. To make it work install the plugin
https://insomnia.rest/plugins/insomnia-plugin-faker
If you like to set things manually , leave this step and edit the data values.

## Environment
The environment variables are used reuse values across multiple requests.
This includes the `superAdminAccessToken` , `apiUrl` and `userAccessToken`. Do edit them before actually using the request
