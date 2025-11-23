
```
healthcare-saas
├─ .editorconfig
├─ backend
│  ├─ appointments
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  ├─ 0001_initial.py
│  │  │  ├─ 0002_alter_appointment_options_remove_appointment_reason_and_more.py
│  │  │  ├─ 0003_remove_appointment_facility_appointment_office_and_more.py
│  │  │  ├─ 0004_alter_appointment_created_at_and_more.py
│  │  │  ├─ 0005_appointment_is_block.py
│  │  │  ├─ 0006_appointment_intake_status_appointment_notes_and_more.py
│  │  │  ├─ 0007_alter_appointment_room.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ authapp
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ migrations
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ validators.py
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
│  │  │  ├─ 0009_alter_patient_options.py
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
│  │  │  ├─ 0002_provider_user.py
│  │  │  └─ __init__.py
│  │  ├─ models.py
│  │  ├─ permissions.py
│  │  ├─ serializers.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  └─ __init__.py
│  ├─ requirements.txt
│  └─ schedule
│     ├─ admin.py
│     ├─ apps.py
│     ├─ migrations
│     │  ├─ 0001_initial.py
│     │  ├─ 0002_alter_schedulesettings_business_hours.py
│     │  └─ __init__.py
│     ├─ models.py
│     ├─ serializers.py
│     ├─ tests.py
│     ├─ urls.py
│     ├─ views.py
│     └─ __init__.py
├─ docker-compose.yml
├─ frontend
│  ├─ dateDriftTest.ts
│  ├─ dateOffsetDiagnostic.ts
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
│  ├─ repeatIsolate.ts
│  ├─ repeatTest.ts
│  ├─ src
│  │  ├─ app
│  │  │  ├─ App.tsx
│  │  │  └─ index.css
│  │  ├─ App.test.tsx
│  │  ├─ components
│  │  │  ├─ common
│  │  │  │  └─ ConfirmDialog.tsx
│  │  │  ├─ CreatePatient.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ DoctorLayout.tsx
│  │  │  │  ├─ Sidebar.tsx
│  │  │  │  └─ TopNavbar.tsx
│  │  │  ├─ Skeleton.tsx
│  │  │  └─ ui
│  │  │     ├─ Alert.tsx
│  │  │     ├─ Dropdown.tsx
│  │  │     ├─ FormField.tsx
│  │  │     ├─ Loader.tsx
│  │  │     ├─ Navbar.tsx
│  │  │     └─ ProfileHeader.tsx
│  │  ├─ features
│  │  │  ├─ auth
│  │  │  │  └─ pages
│  │  │  │     └─ Login.tsx
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
│  │  │  │     ├─ patients.ts
│  │  │  │     └─ patientsApi.ts
│  │  │  ├─ providers
│  │  │  │  ├─ pages
│  │  │  │  │  ├─ CreateProvider.tsx
│  │  │  │  │  ├─ EditInfo.tsx
│  │  │  │  │  ├─ ManageUsers.tsx
│  │  │  │  │  ├─ Notifications.tsx
│  │  │  │  │  ├─ ProviderOptions.tsx
│  │  │  │  │  ├─ ProviderProfile.tsx
│  │  │  │  │  └─ ProvidersList.tsx
│  │  │  │  └─ services
│  │  │  │     ├─ providers.ts
│  │  │  │     └─ providersApi.ts
│  │  │  ├─ schedule
│  │  │  │  ├─ components
│  │  │  │  │  ├─ appointments-table
│  │  │  │  │  │  ├─ AppointmentsTable.tsx
│  │  │  │  │  │  ├─ IntakeDropdown.tsx
│  │  │  │  │  │  ├─ NoteModal.tsx
│  │  │  │  │  │  ├─ RoomModal.tsx
│  │  │  │  │  │  └─ StatusDropdown.tsx
│  │  │  │  │  ├─ DatePickerPopover.tsx
│  │  │  │  │  ├─ filters
│  │  │  │  │  │  └─ ScheduleFilters.tsx
│  │  │  │  │  ├─ grid
│  │  │  │  │  │  ├─ DayViewGrid.tsx
│  │  │  │  │  │  ├─ logic
│  │  │  │  │  │  │  ├─ daySlots.ts
│  │  │  │  │  │  │  ├─ gridCore.ts
│  │  │  │  │  │  │  ├─ labels.ts
│  │  │  │  │  │  │  ├─ timeFormatting.ts
│  │  │  │  │  │  │  └─ weekSlots.ts
│  │  │  │  │  │  └─ WeekViewGrid.tsx
│  │  │  │  │  ├─ modals
│  │  │  │  │  │  ├─ BlockTimeForm.tsx
│  │  │  │  │  │  ├─ EditAppointmentModal.tsx
│  │  │  │  │  │  ├─ MultiSlotModal.tsx
│  │  │  │  │  │  ├─ NewAppointmentModal.tsx
│  │  │  │  │  │  └─ WithPatientForm.tsx
│  │  │  │  │  └─ SettingsPanel.tsx
│  │  │  │  ├─ hooks
│  │  │  │  │  ├─ useBusinessHours.ts
│  │  │  │  │  ├─ useBusinessHoursFilter.ts
│  │  │  │  │  ├─ useOfficePersistence.ts
│  │  │  │  │  ├─ usePatientSearch.ts
│  │  │  │  │  ├─ usePositionedApointments.ts
│  │  │  │  │  ├─ usePrefilledAppointmentFields.ts
│  │  │  │  │  ├─ useScheduleData.ts
│  │  │  │  │  ├─ useScheduleFilters.ts
│  │  │  │  │  ├─ useVisibleAppointments.ts
│  │  │  │  │  └─ _useScheduleView.experimental.ts
│  │  │  │  ├─ logic
│  │  │  │  │  ├─ appointmentPositioning.ts
│  │  │  │  │  ├─ appointmentRange.ts
│  │  │  │  │  ├─ appointmentStatus.ts
│  │  │  │  │  ├─ businessHours.ts
│  │  │  │  │  ├─ clusterCalculations.ts
│  │  │  │  │  ├─ dateMath.ts
│  │  │  │  │  └─ dateNavigation.ts
│  │  │  │  ├─ pages
│  │  │  │  │  └─ Schedule.tsx
│  │  │  │  ├─ services
│  │  │  │  │  ├─ appointmentsApi.ts
│  │  │  │  │  └─ scheduleSettingsApi.ts
│  │  │  │  ├─ types
│  │  │  │  │  ├─ index.ts
│  │  │  │  │  └─ scheduleSettings.ts
│  │  │  │  └─ utils
│  │  │  │     └─ filterAppointments.ts
│  │  │  └─ tasks
│  │  │     └─ pages
│  │  │        └─ Tasks.tsx
│  │  ├─ hooks
│  │  │  ├─ README.md
│  │  │  └─ useOutsideClick.ts
│  │  ├─ index.tsx
│  │  ├─ logo.svg
│  │  ├─ react-app-env.d.ts
│  │  ├─ reportWebVitals.ts
│  │  ├─ services
│  │  │  └─ api.ts
│  │  ├─ setupTests.ts
│  │  ├─ types
│  │  │  └─ lucide-react.d.ts
│  │  └─ utils
│  │     ├─ apiErrors.ts
│  │     ├─ dateUtils.ts
│  │     ├─ toastUtils.ts
│  │     ├─ validation.ts
│  │     └─ weekdays.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.json
│  └─ weekdayAlignmentTest.ts
└─ README.md

```