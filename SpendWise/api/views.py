
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth.models import User
from django.contrib import auth
from django.http import JsonResponse
from rest_framework.permissions import AllowAny


from django.middleware.csrf import get_token

from .serializers import *
from .models import *


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class CatListsView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CatCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def create_category(request):
    if request.method == 'POST':
        # Deserialize the request data using your CategorySerializer
        serializer = CategorySerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if a category with the same name already exists
            category_name = serializer.validated_data['name']
            existing_category = Category.objects.filter(name=category_name).first()
            
            if existing_category:
                # Respond with a message indicating that the category already exists
                return Response({'detail': 'Category with this name already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the new category to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        

@api_view(['GET'])
def user_wallets(request):
    main_user = User.objects.get(username=request.user.username)
    user_acct = Account.objects.get(user_id=main_user)
    
    try:
        wallets = Wallet.objects.filter(owner=user_acct)

        for i in wallets:
            try:
                incomes = Entry.objects.filter(type_x=1, wallet=i)
                expense_entry = Entry.objects.filter(type_x=2, wallet=i)
                total_income = 0
                total_exp = 0
                for k in incomes:
                    total_income = total_income + k.amount
                for k in expense_entry:
                    total_exp = total_exp + k.amount

                i.balance = total_income - total_exp
                i.total_income = total_income
                i.total_expense = total_exp
                i.save()
            except Income.DoesNotExist and Expense.DoesNotExist:
                return Response({'message': 'Wallet has no entries'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = WalletSerializer(wallets, many=True)
    except Wallet.DoesNotExist:
        return Response({'message': 'Wallet does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.data)


@api_view(['POST', 'GET'])
def wallet_details(request, id):
    main_user = User.objects.get(username=request.user.username)
    user_acct = Account.objects.get(user_id=main_user)
    try:
        wallet = Wallet.objects.get(id=id)

        if request.method == 'GET':
            if wallet.owner == user_acct:

                income_entries = Entry.objects.filter(type_x=1, wallet=wallet)
                expense_entries = Entry.objects.filter(type_x=2, wallet=wallet)

                total_income = 0
                total_exp = 0
                for k in income_entries:
                    total_income = total_income + k.amount
                for k in expense_entries:
                    total_exp = total_exp + k.amount

                wallet.balance = total_income - total_exp
                wallet.total_income = total_income
                wallet.total_expense = total_exp
                wallet.save()

                serializer = WalletSerializer(wallet)

                return Response(serializer.data)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
    except Wallet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
def entries_view(request, id):
    main_user = User.objects.get(username=request.user.username)
    user_acct = Account.objects.get(user_id=main_user)
    
    try:
        wallets = Wallet.objects.get(id=id)

        if request.method == 'GET':
            if wallets.owner == user_acct:
                try:
                    entries = Entry.objects.filter(wallet=wallets)

                    if entries:
                        serializer = EntriesSerializer(entries, many=True)
                        return Response(serializer.data)
                    else:
                        return Response(status=status.HTTP_404_NOT_FOUND)
                except:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(status=status.HTTP_403_FORBIDDEN)
    except Wallet.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)



class CurrentAccountView(generics.RetrieveAPIView):
    serializer_class = AccountSerializer

    def get_object(self):
        # Return the account associated with the currently authenticated user
        return Account.objects.get(user_id=self.request.user)


class UserRegistrationAPIView(APIView):
    def post(self, request):
        serializer = AccountSerializer(data=request.data)  # Use the AccountSerializer
        
        if serializer.is_valid():
            if serializer.validated_data['password'] == serializer.validated_data['password2']:
                user_data = {
                    'username': serializer.validated_data['username'],
                    'password': serializer.validated_data['password'],
                    'first_name': serializer.validated_data['first_name'],
                    'last_name': serializer.validated_data['last_name'],
                }
                user = User.objects.create_user(**user_data)
                
                # Create the Account object
                account_data = {
                    'user_id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
                serializer_account = AccountSerializer(data=account_data)  # Use the AccountSerializer
                if serializer_account.is_valid():
                    serializer_account.save()
                    return Response({'detail': 'User registered successfully'}, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer_account.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#User sign up and log in

@api_view(['POST'])
def user_signup(request):
    if request.method == 'POST':
        username = request.POST['username']
        first_name = request.POST['first_name']
        last_name = request.POST['last_name']
        password = request.POST['password']

        
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'Username already exists!'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            user = User.objects.create_user(username=username, first_name=first_name, last_name=last_name, password=password)
            user.save()

            user_login = auth.authenticate(username=username, password=password)
            auth.login(request, user_login)

            user_model = User.objects.get(username=username)
            new_acc = Account.objects.create(user_id=user_model, first_name=first_name, last_name=last_name)
            new_acc.save()
            return Response({'detail': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    # return redirect('index')


@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = auth.authenticate(request, username=username, password=password)

    if user is not None:
        # The user is authenticated, log them in
        auth.login(request, user)
        return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
    else:
        # Authentication failed
        return Response({'message': 'Login failed'}, status=status.HTTP_400_BAD_REQUEST)



class createWalletView(generics.CreateAPIView):
    serializer_class = WalletCreateSerializer

    def post(self, request):
        try:
            main_user = User.objects.get(username=request.user.username)
            user_acct = Account.objects.get(user_id=main_user)

            name = request.data.get('name')
            budget = request.data.get('budget')

            data_to_serialize = {
                'owner': user_acct.id,
                'name': name,
                'budget': budget
            }

            serializer = WalletCreateSerializer(data=data_to_serialize)

            if serializer.is_valid():
                serializer.save()
                return Response({'message': 'Wallet Created', 'data': serializer.data}, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        except Account.DoesNotExist:
            return Response({'message': 'Account does not exist'}, status=status.HTTP_400_BAD_REQUEST)


# class EntryView(generics.ListCreateAPIView):
#     serializer_class = EntriesSerializer

#     def get(self, request, id):
#         main_user = User.objects.get(username=request.user.username)
#         user_acct = Account.objects.get(user_id=main_user)
        
#         try:
#             wallets = Wallet.objects.get(id=id)

#             if request.method == 'GET':
#                 if wallets.owner == user_acct:
#                     try:
#                         entries = Entry.objects.filter(wallet=wallets)

#                         if entries:
#                             serializer = EntriesSerializer(entries, many=True)
#                             return Response(serializer.data)
#                         else:
#                             return Response(status=status.HTTP_404_NOT_FOUND)
#                     except:
#                         return Response(status=status.HTTP_404_NOT_FOUND)
#                 else:
#                     return Response(status=status.HTTP_403_FORBIDDEN)
#         except Wallet.DoesNotExist:
#             return Response(status=status.HTTP_404_NOT_FOUND)

#     def post(self, request, id):
#         try:
#             main_user = User.objects.get(username=request.user.username)
#             user_acct = Account.objects.get(user_id=main_user)
#             get_wallet = Wallet.objects.get(id=id)

#             if get_wallet.owner != user_acct:
#                 return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
#             else:
#                 title = request.data.get('title')
#                 amount = request.data.get('amount')
#                 category = request.data.get('category')
#                 description = request.data.get('description')
#                 type_x = request.data.get('type_x')

#                 category_name = Category.objects.get(name=category)
#                 type_name = EntryType.objects.get(label=type_x)

#                 # Manually insert data into the serializer
#                 data_to_serialize = {
#                     'wallet': get_wallet.id,
#                     'title': title,
#                     'amount': amount,
#                     'category': category_name.id,
#                     'description': description,
#                     'type_x': type_name.id
#                 }

#                 serializer = EntriesSerializer(data=data_to_serialize)

#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response({'message': 'Entry was successful', 'data': serializer.data}, status=status.HTTP_201_CREATED)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         except User.DoesNotExist:
#             return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         except Account.DoesNotExist:
#             return Response({'message': 'Account does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         except Wallet.DoesNotExist:
#             return Response({'message': 'Wallet does not exist'}, status=status.HTTP_400_BAD_REQUEST)

class EntryView(generics.ListCreateAPIView):
    serializer_class = EntriesSerializer

    def get_queryset(self):
        id = self.kwargs.get('id')
        main_user = self.request.user
        user_acct = Account.objects.get(user_id=main_user)

        try:
            wallet = Wallet.objects.get(id=id)

            if wallet.owner == user_acct:
                entries = Entry.objects.filter(wallet=wallet)
                return entries
            else:
                raise PermissionDenied("Access denied")

        except Wallet.DoesNotExist:
            raise NotFound("Wallet not found")

    def post(self, request, id):
        try:
            main_user = User.objects.get(username=request.user.username)
            user_acct = Account.objects.get(user_id=main_user)
            get_wallet = Wallet.objects.get(id=id)

            if get_wallet.owner != user_acct:
                return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            else:
                title = request.data.get('title')
                amount = request.data.get('amount')
                category = request.data.get('category')
                description = request.data.get('description')
                type_x = request.data.get('type_x')
                # typeX = EntryType.objects.get(label=type_x)
                category_name = Category.objects.get(name=category)

                # Manually insert data into the serializer
                data_to_serialize = {
                    'wallet': get_wallet.id,
                    'title': title,
                    'amount': amount,
                    'category': category_name.id,
                    'description': description,
                    'type_x': type_x,
                }

                serializer = EntriesSerializer(data=data_to_serialize)

                if serializer.is_valid():
                    serializer.save(wallet=get_wallet)
                    return Response({'message': 'Entry was successful', 'data': serializer.data}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': 'Serializer not valid', 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except (User.DoesNotExist, Account.DoesNotExist, Wallet.DoesNotExist):
            return Response({'message': 'User, Account, or Wallet does not exist'}, status=status.HTTP_400_BAD_REQUEST)


# class IncomeEntryView(generics.CreateAPIView):
#     serializer_class = IncomeEntrySerializer

#     def post(self, request, id):
#         try:
#             main_user = User.objects.get(username=request.user.username)
#             user_acct = Account.objects.get(user_id=main_user)
#             get_wallet = Wallet.objects.get(id=id)

#             if get_wallet.owner != user_acct:
#                 return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
#             else:
#                 title = request.data.get('title')
#                 amount = request.data.get('amount')
#                 category = request.data.get('category')
#                 description = request.data.get('description')
#                 type_x = request.data.get('type_x')
#                 category_name = Category.objects.get(name=category)

#                 # Manually insert data into the serializer
#                 data_to_serialize = {
#                     'wallet': get_wallet.id,
#                     'title': title,
#                     'amount': amount,
#                     'category': category_name.id,
#                     'description': description,
#                     'type_x': type_x
#                 }

#                 serializer = IncomeEntrySerializer(data=data_to_serialize)

#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response({'message': 'Entry was successful', 'data': serializer.data}, status=status.HTTP_201_CREATED)
#                 else:
#                     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         except User.DoesNotExist:
#             return Response({'message': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         except Account.DoesNotExist:
#             return Response({'message': 'Account does not exist'}, status=status.HTTP_400_BAD_REQUEST)
#         except Wallet.DoesNotExist:
#             return Response({'message': 'Wallet does not exist'}, status=status.HTTP_400_BAD_REQUEST)



def get_csrf(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrf_token': csrf_token})
