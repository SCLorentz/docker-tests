# not working now

docker build -t xrdp .
docker run -d -p 3389:3389 --name xrdp ./docker/xrdp