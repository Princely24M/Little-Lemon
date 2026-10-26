import json

from django.core import serializers
from django.db import IntegrityError
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.http import require_http_methods

from .models import Booking

MIN_SLOT = 10
MAX_SLOT = 20


def home(request):
    return render(request, "index.html")


def about(request):
    return render(request, "about.html")


def menu(request):
    return render(request, "menu.html")


def book(request):
    return render(request, "book.html")


def reservations(request):
    """All reservations rendered as JSON (criterion 6)."""
    bookings = serializers.serialize(
        "json",
        Booking.objects.order_by("reservation_date", "reservation_slot"),
        indent=2,
    )
    return render(request, "bookings.html", {"bookings": bookings})


@require_http_methods(["GET", "POST"])
def bookings(request):
    if request.method == "POST":
        return _create_booking(request)

    # GET /bookings?date=YYYY-MM-DD (criterion 10)
    raw_date = request.GET.get("date")
    day = parse_date(raw_date) if raw_date else timezone.localdate()
    if day is None:
        return JsonResponse({"error": "Invalid date"}, status=400)

    queryset = Booking.objects.filter(reservation_date=day).order_by("reservation_slot")
    return HttpResponse(serializers.serialize("json", queryset), content_type="application/json")


def _create_booking(request):
    try:
        data = json.loads(request.body)
        first_name = str(data["first_name"]).strip()
        day = parse_date(str(data["reservation_date"]))
        slot = int(data["reservation_slot"])
    except (ValueError, KeyError, TypeError):
        return JsonResponse({"error": "Invalid request"}, status=400)

    if not first_name or day is None or not (MIN_SLOT <= slot <= MAX_SLOT):
        return JsonResponse({"error": "Invalid name, date or slot"}, status=400)

    # Duplicate check (criteria 7 and 9). The unique_together constraint
    # covers the race condition where two requests pass this check at once.
    if Booking.objects.filter(reservation_date=day, reservation_slot=slot).exists():
        return JsonResponse({"error": "That slot is already booked"}, status=409)
    try:
        Booking.objects.create(first_name=first_name, reservation_date=day, reservation_slot=slot)
    except IntegrityError:
        return JsonResponse({"error": "That slot is already booked"}, status=409)

    return JsonResponse({"saved": 1}, status=201)
