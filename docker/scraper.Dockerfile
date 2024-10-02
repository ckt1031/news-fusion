FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile --upgrade -r requirements.txt

# RUN
CMD ["python", "scraper.py", "cron"]
