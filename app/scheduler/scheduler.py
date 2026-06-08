from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.reminder_service import check_for_checkin_reminder, check_for_checkout_reminder
scheduler = AsyncIOScheduler()

scheduler.add_job(
    check_for_checkin_reminder,
    trigger="interval",
    minutes=1,
    id = "Check_in_reminder_schedule"
)

scheduler.add_job(
    check_for_checkout_reminder,
    trigger="interval",
    minutes=1,
    id = "Check_out_reminder_schedule"
)