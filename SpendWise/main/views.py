from django.shortcuts import render, redirect
from django.http import HttpResponse

from django.contrib import messages
from django.contrib.auth.models import User, auth
from django.contrib.auth.decorators import login_required

from operator import attrgetter

from api.models import *

from .models import *

@login_required(login_url='/')
def home(request):
  if request.user is None:
    return redirect('/')
  else:
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
    # incomes = Income.objects.all()
    # expenses = Expense.objects.all()

    # incomes = list(Income.objects.all())
    # expenses = list(Expense.objects.all())

    # # Combine both lists
    # ex_in = incomes + expenses

    # # Sort the combined list by entry date
    # sorted_ex_in = sorted(ex_in, key=attrgetter('entry'))

    # for obj in sorted_ex_in:
    #   if isinstance(obj, Income):
    #     type_x = EntryType.objects.get(label='Income')
    #   else:
    #     type_x = EntryType.objects.get(label='Expense')

    #   make_new_entry = Entry.objects.create(
    #       wallet=obj.wallet,
    #       title=obj.title,
    #       amount=obj.amount,
    #       category=obj.category,
    #       description=obj.description,
    #       type_x=type_x,  # Assuming type_x is a ForeignKey to EntryType
    #       entry=obj.entry
    #   )
    #   make_new_entry.save()

    return render(request, 'index.html')


def active_wallet(request):
  return render(request, 'home.html')


def landing(request):
  return render(request, "landing.html")

def signup(request):
  return render(request, 'signup.html')


def login(request):
  return render(request, 'login.html')