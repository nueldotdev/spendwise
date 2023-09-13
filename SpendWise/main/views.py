from django.shortcuts import render, redirect
from django.http import HttpResponse

from django.contrib import messages
from django.contrib.auth.models import User, auth
from django.contrib.auth.decorators import login_required

from api.models import *

from .models import *

def home(request):
    # cat_icons = "\category-icons"
    # new_cat_icons = Category.objects.all()

    # for i in new_cat_icons:
    #    new_name = i.name.lower()
    #    new_name = new_name.replace(' ', '-')
    #    new_name = f"\{new_name}"
    #    i.icon = cat_icons + new_name + '.png'
    #    i.save()
    #    print('done')

    # categories = [
    #     "Housing",
    #     "Transportation",
    #     "Food and Groceries",
    #     "Health and Wellness",
    #     "Entertainment",
    #     "Education",
    #     "Debts and Loans",
    #     "Personal Care",
    #     "Gifts and Donations",
    #     "Travel",
    #     "Utilities",
    #     "Taxes",
    #     "Savings and Investments",
    #     "Business Expenses",
    #     "Miscellaneous"
    # ]

    # for i in categories:
    #     get_cat = Category.objects.get(name=i)
    #     if get_cat:
    #         pass
    #     else:
    #         new_cat = Category.objects.create(name=i)
    #         new_cat.save()

    return render(request, 'index.html')


def active_wallet(request):
  return render(request, 'home.html')


def landing(request):
  return render(request, "landing.html")

def signup(request):
  return render(request, 'signup.html')


def login(request):
  return render(request, 'login.html')