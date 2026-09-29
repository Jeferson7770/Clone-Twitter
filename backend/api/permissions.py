from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Permite que qualquer utilizador leia (GET), mas apenas o autor pode modificar ou apagar (PUT, PATCH, DELETE).
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.author == request.user
