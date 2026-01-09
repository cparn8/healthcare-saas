from django.core.management.base import BaseCommand
from core.demo_reset import reset_and_seed_demo_data


class Command(BaseCommand):
    help = "Wipe and reseed deterministic demo data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")
        summary = reset_and_seed_demo_data()
        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully"))
        for k, v in summary.items():
            self.stdout.write(f"{k}: {v}")
