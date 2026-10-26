from django.db import models


class Booking(models.Model):
    first_name = models.CharField(max_length=200)
    reservation_date = models.DateField()
    # Hour of the day in 24h format: 10 = 10 AM ... 20 = 8 PM
    reservation_slot = models.SmallIntegerField(default=10)

    class Meta:
        # Database-level guarantee against double booking (criteria 7 and 9)
        unique_together = ("reservation_date", "reservation_slot")

    def __str__(self):
        return f"{self.first_name} - {self.reservation_date} @ {self.reservation_slot}:00"
