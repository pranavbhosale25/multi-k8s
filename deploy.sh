# build the images
docker build -t pranavbhosale25/multi-client:latest -t pranavbhosale25/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t pranavbhosale25/multi-server:latest -t pranavbhosale25/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t pranavbhosale25/multi-worker:latest -t pranavbhosale25/multi-worker:$SHA -f ./worker/Dockerfile ./worker  

# push images to docker
docker push pranavbhosale25/multi-client:latest
docker push pranavbhosale25/multi-client:$SHA

docker push pranavbhosale25/multi-server:latest
docker push pranavbhosale25/multi-server:$SHA

docker push pranavbhosale25/multi-worker:latest
docker push pranavbhosale25/multi-worker:$SHA

# apply k8s configs
kubectl apply -f k8s
# ensure latest image is picked 
kubectl set image deployments/server-deployment server=pranavbhosale25/multi-server:$SHA
kubectl set image deployments/client-deployment client=pranavbhosale25/multi-client:$SHA
kubectl set image deployments/worker-deployment worker=pranavbhosale25/multi-worker:$SHA