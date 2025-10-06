from django.contrib import admin
from django.utils.html import format_html
from .models import Provider


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    list_display = (
        "display_name",
        "specialty",
        "email",
        "phone",
        "created_at",
        "user_link",
    )
    search_fields = ("first_name", "last_name", "email", "specialty")
    readonly_fields = ("created_at", "user_link")

    def display_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    display_name.short_description = "Name"

    def user_link(self, obj):
        """Clickable link to the linked Django User record."""
        if obj.user:
            return format_html(
                '<a href="/admin/auth/user/{}/change/">{}</a>',
                obj.user.id,
                obj.user.username,
            )
        return "—"
    user_link.short_description = "Linked User"
