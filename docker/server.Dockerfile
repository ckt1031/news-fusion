FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile --upgrade -r requirements.txt

# Make port 4782 available to the world outside this container
EXPOSE 4782

# RUN
CMD ["fastapi", "server.py", "--proxy-headers", "--port", "4782"]