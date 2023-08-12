#!/bin/sh

# Define the service name
service="nestify"

# Construct the deployment command
deploy_command="docker-compose up $service -d"

# Check if "build" is passed as an argument
if [ "$1" = "build" ]; then
    deploy_command="$deploy_command --build"
fi

# Update the repository with the latest changes
git pull --no-edit -X theirs

# Check if docker-compose is installed
if command -v docker-compose >/dev/null 2>&1; then
    # Replace "docker-compose" with "docker compose" in the deploy command
    deploy_command=${deploy_command//docker-compose/docker compose}
fi

# Print the constructed deployment command
echo "Deployment Command: $deploy_command"

# Execute the deployment command
eval "$deploy_command"

# Remove dangling Docker images (if needed)
docker rmi -f $(docker images -f "dangling=true" -q)
