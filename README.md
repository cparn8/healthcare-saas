# healthcare-saas
```
healthcare-saas
├─ backend
│  ├─ appointments
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ core
│  │  ├─ asgi.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  ├─ wsgi.py
│  │  └─ __init__.py
│  ├─ Dockerfile
│  ├─ manage.py
│  ├─ patients
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  ├─ 0002_remove_patient_phone_number_patient_avatar_and_more.py
│  │  │  ├─ 0003_alter_patient_prn.py
│  │  │  ├─ 0004_alter_patient_prn.py
│  │  │  ├─ 0005_remove_patient_avatar_remove_patient_created_at_and_more.py
│  │  │  ├─ 0006_alter_patient_gender.py
│  │  │  ├─ 0007_alter_patient_prn.py
│  │  │  ├─ 0008_alter_patient_prn.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ providers
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  └─ requirements.txt
├─ docker-compose.yml
├─ frontend
│  ├─ dockerfile
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ images
│  │  │  ├─ patient-placeholder.png
│  │  │  └─ provider-placeholder.png
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  ├─ README.md
│  ├─ src
│  │  ├─ api.ts
│  │  ├─ App.css
│  │  ├─ App.test.tsx
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ Alert.tsx
│  │  │  ├─ CreatePatient.tsx
│  │  │  ├─ DoctorLayout.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ TopNavbar.tsx
│  │  ├─ features
│  │  │  ├─ appointments
│  │  │  │  ├─ pages
│  │  │  │  │  ├─ BookAppointment.tsx
│  │  │  │  │  └─ Schedule.tsx
│  │  │  │  └─ services
│  │  │  │     └─ appointments.ts
│  │  │  ├─ charts
│  │  │  │  └─ pages
│  │  │  │     ├─ Charts.tsx
│  │  │  │     └─ PatientChart.tsx
│  │  │  ├─ messaging
│  │  │  │  └─ pages
│  │  │  │     └─ Messaging.tsx
│  │  │  ├─ patients
│  │  │  │  ├─ pages
│  │  │  │  │  ├─ PatientProfile.tsx
│  │  │  │  │  └─ PatientsList.tsx
│  │  │  │  └─ services
│  │  │  │     └─ patients.ts
│  │  │  ├─ providers
│  │  │  │  ├─ pages
│  │  │  │  │  ├─ EditInfo.tsx
│  │  │  │  │  ├─ ProviderOptions.tsx
│  │  │  │  │  └─ ProvidersList.tsx
│  │  │  │  └─ services
│  │  │  │     └─ providers.ts
│  │  │  └─ tasks
│  │  │     └─ pages
│  │  │        └─ Tasks.tsx
│  │  ├─ index.css
│  │  ├─ index.tsx
│  │  ├─ logo.svg
│  │  ├─ oldpages
│  │  │  ├─ ManageUsers.tsx
│  │  │  └─ Notifications.tsx
│  │  ├─ react-app-env.d.ts
│  │  ├─ reportWebVitals.ts
│  │  ├─ services
│  │  │  └─ api.ts
│  │  ├─ setupTests.ts
│  │  └─ utils
│  │     └─ formatDate.ts
│  ├─ tailwind.config.js
│  └─ tsconfig.json
└─ README.md

```