docker build -t clavance/fib-client:latest -t clavance/fib-client:$SHA -f ./client/Dockerfile ./client
docker build -t clavance/fib-server:latest -t clavance/fib-server:$SHA -f ./server/Dockerfile ./server
docker build -t clavance/fib-worker:latest -t clavance/fib-worker:$SHA -f ./worker/Dockerfile ./worker
docker push clavance/fib-client:latest
docker push clavance/fib-server:latest
docker push clavance/fib-worker:latest
docker push clavance/fib-client:$SHA
docker push clavance/fib-server:$SHA
docker push clavance/fib-worker:$SHA
kubectl apply -f kubernetes
kubectl set image deployments/client-deployment client=clavance/fib-client:$SHA
kubectl set image deployments/server-deployment server=clavance/fib-server:$SHA
kubectl set image deployments/worker-deployment worker=clavance/fib-worker:$SHA
