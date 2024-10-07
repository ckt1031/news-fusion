FROM python:3.12

ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get -y install cron

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app
COPY ../crontab /etc/cron.d/crontab

RUN chmod 0644 /etc/cron.d/crontab

RUN crontab /etc/cron.d/crontab

# Create empty log (TAIL needs this)
RUN touch /tmp/out.log

# Install any needed packages specified in requirements.txt
RUN pip3 install --no-cache-dir --no-compile --upgrade -r requirements.txt

ENV PYTHONPATH "${PYTHONPATH}:/usr/local/lib/python3.12/site-packages"

# RUN
CMD cron && tail -f /tmp/out.log
