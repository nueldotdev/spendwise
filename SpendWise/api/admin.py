from django.contrib import admin
from .models import *
# Register your models here.
admin.site.register(Account)
admin.site.register(Category)
admin.site.register(Wallet)
admin.site.register(Expense)
admin.site.register(Income)
admin.site.register(Entry)
admin.site.register(EntryType)