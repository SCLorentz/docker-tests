docker build -t html-page .
docker run -d -p 8080:80 html-page