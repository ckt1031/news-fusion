FROM python:3.13-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Update and install required packages
RUN apk update

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile --upgrade -r requirements.txt

# Make port 4782 available to the world outside this container
EXPOSE 4782/tcp

ENV IS_PRODUCTION=true

# RUN
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "4782", "--proxy-headers", "--log-level", "critical"]
