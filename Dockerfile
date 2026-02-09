# Use an official Python runtime as a parent image, specifying Python 3.10
FROM python:3.10-slim-buster

# Set the working directory inside the container
WORKDIR /app

# Copy pyproject.toml to install dependencies
# This is done separately to leverage Docker's build cache:
# if pyproject.toml doesn't change, these steps aren't re-run.
COPY pyproject.toml .
COPY README.md .

# Install build backend (hatchling) and then the project's dependencies
# The project will be installed, pulling in all dependencies listed in pyproject.toml.
# --no-cache-dir flag is used to prevent pip from caching packages,
# which reduces the Docker image size.
RUN pip install --no-cache-dir hatchling && pip install --no-cache-dir .

# Copy the entire 'app' directory content into the container's /app directory.
# This includes main.py, .env, static/, and google_search_agent/.
COPY app/ .

# Cloud Run expects the application to listen on the port specified by the PORT environment variable.
# We'll expose 8080 as a common default, and Uvicorn will be configured to use $PORT.
EXPOSE 8080

# Command to run the application using Uvicorn.
# We use 0.0.0.0 to listen on all available network interfaces.
# We explicitly use the PORT environment variable as required by Cloud Run.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]