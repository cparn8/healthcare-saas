# backend/locations/admin.py
from django.contrib import admin
from .models import BusinessSettings, Location, LocationHours


@admin.register(BusinessSettings)
class BusinessSettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "show_name_in_nav", "created_at", "updated_at")


class LocationHoursInline(admin.TabularInline):
    model = LocationHours
    extra = 0


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "is_active", "created_at", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "phone", "email")
    inlines = [LocationHoursInline]


@admin.register(LocationHours)
class LocationHoursAdmin(admin.ModelAdmin):
    list_display = ("id", "location", "weekday", "open", "start", "end")
    list_filter = ("location", "weekday", "open")
