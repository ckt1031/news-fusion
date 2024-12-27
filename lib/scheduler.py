from apscheduler.schedulers.background import (
    BackgroundScheduler,
)  # runs tasks in the background
from apscheduler.triggers.cron import (
    CronTrigger,
)  # allows us to specify a recurring time for execution

from lib.pubsub.subscription import register_all_topics

# Set up the scheduler
scheduler = BackgroundScheduler()
trigger = CronTrigger(hour=0, minute=0)  # midnight every day
scheduler.add_job(register_all_topics, trigger)
scheduler.start()
