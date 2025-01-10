FROM python:3.12-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE=1

# Run as non-root user
RUN useradd --system --no-create-home appuser
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY requirements.txt /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app

# Make directory tmp, and give appuser permission to write to it
RUN mkdir /app/tmp && chown appuser /app/tmp

USER appuser

# Make port 4782 available to the world outside this container
EXPOSE 4782/tcp

ENV IS_PRODUCTION=true

# RUN
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "4782", "--proxy-headers", "--log-level", "critical"]
