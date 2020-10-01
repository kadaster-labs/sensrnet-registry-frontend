#/bin/sh

# Build the testing environment
docker build -t sensrnet/front-end-tests -f Dockerfile.test .

# Run unit tests
docker run --rm -v $PWD:/app sensrnet/front-end-tests npm run test

# Run e2e tests
docker run --rm -v $PWD:/app sensrnet/front-end-tests npm run e2e
