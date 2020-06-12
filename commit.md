merge changes and add authentication

- Project has been restructured to allow Angular routing, with protected 
endpoints. When not logged in, a user is redirected to the login page.
- A registration page has been added, with basic validation. Upon submitting,
a POST request is made to the back-end. After succesful registration, the user
returns to the login page.
- Upon logging in, the user recieves an JWT access token. This token is stored
in localStorage and appended to future HTTP requests. This appending is done by
a special JWT interceptor. Similary, an error interceptor is defined for 
handling HTTP error codes.
- Alongside the authentication service, an additional owner service has been 
added for keeping track of the currently logged in owner. Note: for now, the 
concept of owner and user is the same. In the future, these will be decoupled.
Then, this will become the user service, tracking the logged in user. A
seperate Owner service will then be added.
- An alert service + component is added for showing messages on the login and 
registration pages.

Fixes: https://github.com/kadaster-labs/sensrnet-registry-frontend/issues/12
