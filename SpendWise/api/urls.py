from django.urls import path
from .views import *

urlpatterns = [
    path("", UserListView.as_view(), name="user-list"),
    path('current-account', CurrentAccountView.as_view(), name='current-account'),
    path('register', user_signup, name='user-registration'),
    path('login', user_login, name='user-login'),

    path('token', get_csrf, name='get-token'),

    path('categories', CatListsView.as_view(), name='categories'),
    path('categories/create', create_category, name='categories-create'),

    path('wallets', user_wallets, name='wallets'),
    path('wallets/create', createWalletView.as_view(), name='wallet-create'),
    path('wallets/<id>', wallet_details, name='wallets-details'),
    path('wallets/<id>/entries', EntryView.as_view(), name='wallets-entries'),
    # path('wallets/<id>/income', IncomeEntryView.as_view(), name='wallets-income-entry'),
    # path('wallets/<id>/expense', ExpenseEntryView.as_view(), name='wallets-expense-entry'),

]
