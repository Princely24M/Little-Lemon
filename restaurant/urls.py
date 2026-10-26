from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("menu/", views.menu, name="menu"),
    path("book/", views.book, name="book"),
    path("reservations/", views.reservations, name="reservations"),
    # No trailing slash on purpose: the fetch() calls use /bookings and a
    # redirect would turn a POST into a failed request.
    path("bookings", views.bookings, name="bookings"),
]
