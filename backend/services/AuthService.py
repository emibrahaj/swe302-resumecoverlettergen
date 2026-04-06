from supabase import Client

from backend.schemas.AuthSchema import UserRegister, UserLogin


class AuthService:
    def __init__(self, db_client: Client):
        self.db_client = db_client

    def register(self, user_data: UserRegister):
        # creates a new user in the db
        response = self.db_client.auth.sign_up({
            "email":  user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })
        return response

    def login(self, data: UserLogin):
        # logs in an existing user and returns a JWT session
        response = self.db_client.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
        return response

    def logout(self):
        # logs out the current user by invalidating the JWT session
        return self.db_client.auth.sign_out()
