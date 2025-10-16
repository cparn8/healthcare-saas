from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    """
    Allow read-only access to all authenticated users.
    Only admins can modify or delete others.
    Providers can edit their own profile.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in SAFE_METHODS:
            return True

        # Admin users can do anything
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Providers can edit their own profile only
        return hasattr(obj, 'user') and obj.user == request.user
