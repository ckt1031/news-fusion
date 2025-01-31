FROM python:3.12-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy the current directory contents into the container at /app
COPY requirements.txt /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Create a non-root user for security
RUN useradd --system --no-create-home appuser
USER appuser

# Make port 4782 available to the world outside this container
EXPOSE 4782/tcp

ENV IS_PRODUCTION=true

# Check /health endpoint to see if the response is "OK"
HEALTHCHECK CMD wget -q -O - http://localhost:4782/health | grep -q "OK"

# RUN
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "4782", "--proxy-headers", "--log-level", "critical"]
