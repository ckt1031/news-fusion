FROM python:3.12

ENV PYTHONDONTWRITEBYTECODE=1

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app
COPY ../crontab /etc/cron.d/crontab

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --no-compile --upgrade -r requirements.txt

RUN chmod 0644 /etc/cron.d/crontab

RUN crontab /etc/cron.d/crontab

# Create empty log (TAIL needs this)
RUN touch /tmp/out.log

# RUN
CMD cron && tail -f /tmp/out.log
