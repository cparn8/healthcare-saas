import os
from pathlib import Path
from decouple import config
from datetime import timedelta
from urllib.parse import urlparse




# -------------------------------------------------
# Base Directories
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------------------------
# Security / Debug
# -------------------------------------------------
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-zca1vw+o6rg^ib)zbin!c@v203(p)=x75d_apy465t-097lio7")
DEBUG = os.getenv("DJANGO_DEBUG", "True") == "True"
if DEBUG:
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
    ]
else:
    ALLOWED_HOSTS = [
        "clayparnell.com",
        "www.clayparnell.com",
        "api.clayparnell.com",
    ]

print(f"🌍 DJANGO_ENV: {os.getenv('DJANGO_ENV', 'dev')} — Loaded settings for {'Debug' if DEBUG else 'Production'} mode")
# -------------------------------------------------
# Installed Apps
# -------------------------------------------------
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "django_filters",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",

    # Local apps
    "core",
    "patients",
    "providers",
    "appointments",
    "authapp",
    "schedule",
    "locations",
]

# -------------------------------------------------
# Middleware (CORS must appear BEFORE CommonMiddleware)
# -------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",  # must come before CommonMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -------------------------------------------------
# Dynamic CORS & CSRF Configuration (fixed)
# -------------------------------------------------

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
parsed = urlparse(FRONTEND_URL)
frontend_origin = f"{parsed.scheme}://{parsed.netloc}"

# Shared headers (needed for JWT + API calls)
CORS_ALLOW_HEADERS = [
    "Authorization",
    "Content-Type",
    "Accept",
    "Origin",
    "User-Agent",
    "DNT",
    "Cache-Control",
    "X-Requested-With",
    "X-CSRFToken",
]

CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
CORS_ALLOW_CREDENTIALS = True

if DEBUG:
    # --- Development Mode ---
    CORS_ALLOW_ALL_ORIGINS = True
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    print(f"🌍 DEBUG mode — trusting {CSRF_TRUSTED_ORIGINS}")

else:
    # --- Production Mode ---
    CORS_ALLOW_ALL_ORIGINS = False  # lock down explicitly
    CORS_ALLOWED_ORIGINS = [frontend_origin]
    CSRF_TRUSTED_ORIGINS = [frontend_origin]
    print(f"🔒 Production CORS locked to {frontend_origin}")



# -------------------------------------------------
# URL & Templates
# -------------------------------------------------
ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# -------------------------------------------------
# Database (Dockerized PostgreSQL / RDS)
# -------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB"),
        "USER": os.getenv("POSTGRES_USER"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST", "db"),
        "PORT": os.getenv("POSTGRES_PORT", 5432),
    }
}

# -------------------------------------------------
# RDS requires SSL in production
# -------------------------------------------------
if not DEBUG:
    DATABASES["default"]["OPTIONS"] = {
        "sslmode": "require",
    }

# -------------------------------------------------
# Authentication
# -------------------------------------------------
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",  # required for `authenticate()`
]

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------
# Internationalization
# -------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Chicago"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------
# Static & Media
# -------------------------------------------------
STATIC_URL = "static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -------------------------------------------------
# REST Framework / JWT
# -------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",  # only /auth/login is AllowAny
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=50),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}
