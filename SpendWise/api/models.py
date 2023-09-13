from django.db import models
import string
import random
from django.contrib.auth import get_user_model
import uuid
from datetime import datetime
from django.utils import timezone

from django.utils.text import slugify

User = get_user_model()

# Create your models here.
class Account(models.Model):
  user_id = models.ForeignKey(User, on_delete=models.CASCADE)
  pin = models.CharField(max_length=5, default=00000, blank=False)
  first_name = models.CharField(max_length=30, blank=False)
  last_name = models.CharField(max_length=30, blank=False)
  balance = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
  profile_img = models.ImageField(upload_to='profile_images', default='blank-pfp.png')

  def __str__(self):
      return self.user_id.username


class Wallet(models.Model):
   owner = models.ForeignKey(Account, on_delete=models.CASCADE)
   name = models.CharField(max_length=20, blank=False)
   budget = models.IntegerField(default=0)
   balance = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
   total_expense = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
   total_income = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
   slug = models.SlugField(max_length=100, unique=True, blank=True)
   created = models.DateTimeField(default=timezone.now)
   last_entry = models.DateTimeField(default=timezone.now)

   def __str__(self):
      return self.name

   def save(self, *args, **kwargs):
      self.slug = slugify(self.name)
      super(Wallet, self).save(*args, **kwargs)


class Category(models.Model):
    name = models.CharField(max_length=50)
    icon = models.ImageField(upload_to='category-icons', default='blank-pfp.png')

    def __str__(self):
        return self.name


class Expense(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    amount = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    entry = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title


class Income(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    title = models.CharField(max_length=50)
    amount = models.DecimalField(blank=True, default=0000.00, decimal_places=2, max_digits=10)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    entry = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title