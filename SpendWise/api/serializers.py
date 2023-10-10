from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = '__all__'

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'


class WalletCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ('owner', 'name', 'budget')


class IncomeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ('wallet', 'title', 'amount', 'category')



class ExpenseEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ('wallet', 'title', 'amount', 'category')



class EntriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # This will be set dynamically in the view
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Check the instance's type and add a 'type' field to distinguish between Expense and Income
        if isinstance(instance, Expense):
            data['type'] = 'Expense'
        elif isinstance(instance, Income):
            data['type'] = 'Income'
        
        return data