from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        # Run startup bootstrap for Demo/Admin accounts.
        # This is idempotent and guarded so it won't crash during migrations.
        from .bootstrap import ensure_bootstrap_accounts

        ensure_bootstrap_accounts()
