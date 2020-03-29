## Description

An unnecessarily complex web application which allows a user to input an integer index, and returns the corresponding fibonacci term. Using React/Express, nginx, Redis and Postgres. Each component of the application is hosted in its own Docker container. The complete app can be launched with Docker Compose.

<img src="https://raw.githubusercontent.com/clavance/fibonacci/master/app.png" width="300" height="250">

## Architecture
A Postgres database holds all the indices which have been requested by the user. When the user inputs an integer index, the Postgres database is checked to see if the index has been previously requested. If so, the corresponding value is returned from Redis. If not, the value is calculated with a function in the worker module, which then publishes the value to Redis.

<img src="https://raw.githubusercontent.com/clavance/fibonacci/master/flow.png" width="500" height="300">

nginx is used for routing, it runs on port 80 in the container (mapped to port 8080 locally). Upstream servers: client:3000, backend:5000.

<img src="https://raw.githubusercontent.com/clavance/fibonacci/master/routing.png" width="500" height="300">


## Instructions
1. `git clone`
2. Run `docker-compose up --build`
3. If the app does not work on entering an integer index, `ctrl+c` to kill and re-run `docker-compose up`
4. Enter Fibonacci indices as desired.
5. Run `docker-compose down` to stop containers.

## Kubernetes (see Kubernetes branch)
The diagram below depicts the Kubernetes architecture for the same web application. 

Each module of the application is deployed separately, with each module having its own Cluster IP address created through service requests.

To manage the storage to be used by the Postgres database, a [_persistent volume claim_](https://kubernetes.io/docs/tasks/configure-pod-container/configure-persistent-volume-storage/) is made, as defined in the _database-pvc.yaml_ file.

<img src="https://raw.githubusercontent.com/clavance/fibonacci/master/k8s.png" width="550" height="300">
See kubernetes branch for more info.

### Running in development (minikube)

Note that the postgres keys have been stored in a Kubernetes Secret object and referenced with the `secretKeyRef` field in the configuration files. To set this up, from root directory run:
```bash
kubectl create secret generic pgpassword --from-literal PGPASSWORD=[your_desired_password]
```
To check that this has been configured correctly, run `kubectl get secrets` which should return:
```bash
NAME                  TYPE                                  DATA   AGE
pgpassword            Opaque                                1      [ ]
```
Incoming traffic is handled by an [ingress-nginx](github.com/kubernetes/ingress-nginx) service, configured for running on GCP. To set this up, run:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/mandatory.yaml
```
To enable its use with minikube, run:
```bash
minikube addons enable ingress
```

Then, to deploy the application (having cloned the _kubernetes_ branch of this repo), from the root directory run `kubectl apply -f kubernetes`.

For a summary of your setup, run `minikube dashboard`. To check if the project is running correctly in dev, run `minikube ip` and navigate to the IP address in your browser, where you should see the app running.

### With Travis CI builds and GCP/GKE
<img src="https://raw.githubusercontent.com/clavance/fibonacci/master/travis.png" width="300" height="500">

Automatic builds with Travis CI and GCP are configured. See the _travis.yml_ file in the _kubernetes_ branch.
1. First create a Cluster in GCP (requires billing/credit card), eg. a cluster with 3 nodes of n1-standard-1(3.75GB) machines should suffice.
2. Create a Service Account in GCP (go to GCP > IAM & Admin > Service Accounts). Set the Service Account Permissions to Kubernetes Engine Admin. Create Key which should save the Service Account credentials in a JSON file. (Don't expose this file!)
3. Ensure Ruby is installed (`ruby -v`), then run `gem install travis --no-rdoc --no-ri` to install Travis CI CLI to encrypt the Service Account JSON.
4. `travis login` with Github info.
5. `travis encrypt-file [service-account-keys].json -r [github user]/[repo]`
6. Add the configuration provided `openssl aes-256-cbc ... -d` to the `before_install` section of the _.travis.yml_ file and store the .json.enc file in the branch root directory.
7. Add the GCP project ID, compute/zone and cluster name to the `before_install` section of _.travis.yml_:
```bash
before_install:
  - gcloud config set project [multi-k8s-272618]
  - gcloud config set compute/zone [us-central1-c]
  - gcloud container clusters get-credentials [multi-cluster]
```
8. Ensure that Docker environment variables `$DOCKER_USERNAME` and `$DOCKER_PASSWORD` are set up on Travis CI.
9. Set all relevant Docker configurations and tags for Docker Hub as required in the `deploy.sh` file.
10. From the GCP shell terminal (navigate to Activate Cloud Shell), run:
```bash
gcloud config set project [multi-k8s-272618]
gcloud config set compute/zone [us-central1-c]
gcloud container clusters get-credentials [multi-cluster]
```
11. From the GCP shell, add your Postgres Secret object using:
```bash
kubectl create secret generic pgpassword --from-literal PGPASSWORD=[your_desired_password]
```
12. From the GCP shell, install [Helm](github.com/helm/helm) (a Kubernetes package manager):
```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```
13. Since RBAC is enabled by default in GKE, to apply RBAC to an nginx-ingress-controller, the controller must be assigned to a Service Account. Create a Service Account for Tiller in the kube-system namespace, then create and assign to it a new ClusterRoleBinding, then install nginx-ingress with Helm:
```bash
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller 
helm init --service-account tiller --upgrade
helm install my-nginx stable/nginx-ingress --set rbac.create=true
```
14. Push all configuration changes to your repository. If everything has been configured correctly, Travis CI should build automatically. The Docker images should have been built and pushed to Docker Hub, and all deployments should have been deployed in GKE.
15. Locate the IP address endpoint for the nginx ingress controller through GKE via the Services tab. The client for the web application should be hosted at that address.


## Acknowledgements
Credits for all material in this repo to Stephen Grider's Docker tutorial [here](https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/).
