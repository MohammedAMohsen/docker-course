from django.shortcuts import redirect

class AnonymousRequiredMixin:

    def dispatch(self, request, *args, **kwargs):

        if request.user.is_authenticated:
            return redirect('blog-home')

        return super().dispatch(request, *args, **kwargs)