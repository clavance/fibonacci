## Description

An unnecessarily complex web application which allows a user to input an integer index, and returns the corresponding fibonacci term. Using React/Express, nginx, Redis and Postgres. Each component of the application is hosted in its own Docker container. The complete app can be launched with Docker Compose.
![app](https://raw.githubusercontent.com/clavance/fibonacci/master/app.png =250x250)

## Architecture
A Postgres database holds all the indices which have been requested by the user. When the user inputs an integer index, the Postgres database is checked to see if the index has been previously requested. If so, the corresponding value is returned from Redis. If not, the value is calculated with a function in the worker module, which then publishes the value to Redis.
![flow](https://raw.githubusercontent.com/clavance/fibonacci/master/flow.png =500x300)

nginx is used for routing, it runs on port 80 in the container (mapped to port 8080 locally). Upstream servers: client:3000, backend:5000.
![routing](https://raw.githubusercontent.com/clavance/fibonacci/master/routing.png =500x300)

## Instructions
1. `git clone`
2. Run `docker-compose up --build`
3. If the app does not work on entering an integer index, `ctrl+c` to kill and re-run `docker-compose up`
## Acknowledgements
All credits to Stephen Grider's Docker tutorial [here](https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/).
